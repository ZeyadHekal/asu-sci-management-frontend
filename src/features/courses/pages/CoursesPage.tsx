import { useState, useEffect, useMemo } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuEye, LuPlus } from "react-icons/lu";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../../store/authStore";
import { useCourseControllerGetPaginated } from "../../../generated/hooks/coursesHooks/useCourseControllerGetPaginated";
import { useCourseControllerGetMyCourses } from "../../../generated/hooks/coursesHooks/useCourseControllerGetMyCourses";
import { useStudentCourseControllerGetPaginated } from "../../../generated/hooks/student-coursesHooks/useStudentCourseControllerGetPaginated";
import CourseDetailsModal from "../components/CourseDetailsModal";

// Custom debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const CoursesPage = () => {
  const navigate = useNavigate();
  const hasPrivilege = useAuthStore((state) => state.hasPrivilege);
  const [page, setPage] = useState(0);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [search, setSearch] = useState("");
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);

  // Debounce search input with 500ms delay
  const debouncedSearch = useDebounce(search, 500);

  // Determine which API to use based on user privileges
  const canManageAllCourses = hasPrivilege("MANAGE_COURSES");
  const isDoctor = hasPrivilege("TEACH_COURSE");
  const isAssistant = hasPrivilege("ASSIST_IN_COURSE");
  const isStudent = hasPrivilege("STUDY_COURSE");

  // Fetch all courses if user has MANAGE_COURSES privilege
  const { 
    data: allCoursesData, 
    isLoading: isLoadingAll, 
    error: errorAll,
    refetch: refetchAll 
  } = useCourseControllerGetPaginated({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined, // Use debounced search
    sortBy: "created_at",
    sortOrder: "desc"
  }, {
    query: {
      enabled: canManageAllCourses
    }
  });

  // Reset page to 0 when search changes to avoid empty results
  useEffect(() => {
    if (debouncedSearch !== '') {
      setPage(0);
    }
  }, [debouncedSearch]);

  // Fetch doctor's courses if user is a doctor but doesn't have MANAGE_COURSES
  const { 
    data: doctorCoursesData, 
    isLoading: isLoadingDoctor, 
    error: errorDoctor,
    refetch: refetchDoctor 
  } = useCourseControllerGetMyCourses({
    query: {
      enabled: isDoctor && !canManageAllCourses
    }
  });

  // Fetch student courses if user is a student
  const { 
    data: studentCoursesData, 
    isLoading: isLoadingStudent, 
    error: errorStudent,
    refetch: refetchStudent 
  } = useStudentCourseControllerGetPaginated({
    page,
    limit: pageSize,
  }, {
    query: {
      enabled: isStudent && !isDoctor && !canManageAllCourses
    }
  });

  // Determine loading, error, and refetch states
  const isLoading = canManageAllCourses ? isLoadingAll : 
                    (isDoctor && !canManageAllCourses) ? isLoadingDoctor :
                    isLoadingStudent;
  
  const error = canManageAllCourses ? errorAll : 
                (isDoctor && !canManageAllCourses) ? errorDoctor :
                errorStudent;

  const refetch = canManageAllCourses ? refetchAll : 
                  (isDoctor && !canManageAllCourses) ? refetchDoctor :
                  refetchStudent;

  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleAddCourse = () => {
    setCourseToEdit(null);
    setIsAddCourseModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddCourseModalOpen(false);
    setCourseToEdit(null);
  };

  const handleModalSuccess = () => {
    refetch();
  };

  // Filter courses based on search (for non-paginated results)
  const filteredCourses = useMemo(() => {
    let coursesToFilter = [];
    
    if (canManageAllCourses) {
      coursesToFilter = allCoursesData?.data?.items || [];
    } else if (isDoctor && !canManageAllCourses) {
      coursesToFilter = doctorCoursesData?.data || [];
    } else if (isStudent) {
      // TODO: After regenerating API files, these fields will be available:
      // courseType, numberOfStudents, assignedDoctors, requiredSoftware
      // Transform student course data to match the expected format
      const studentCourses = studentCoursesData?.data?.items || [];
      coursesToFilter = studentCourses.map(item => ({
        id: item.courseId,
        courseCode: item.courseCode || '', // Now available from API
        name: item.courseName,
        courseType: (item as any).courseType || "Theory", // Will be properly typed after regeneration
        numberOfStudents: (item as any).numberOfStudents || 0, // Will be properly typed after regeneration
        creditHours: item.credits || 3,
        assignedDoctors: (item as any).assignedDoctors || [], // Will be properly typed after regeneration
      }));
    }

    // For API with server-side search (canManageAllCourses), return as-is since search is handled server-side
    if (canManageAllCourses) {
      return coursesToFilter;
    }

    // For client-side search (doctors and students), filter based on debouncedSearch
    if (debouncedSearch && !canManageAllCourses) {
      const searchTerm = debouncedSearch.toLowerCase();
      const searchTermNoSpaces = searchTerm.replace(/\s+/g, '');
      
      return coursesToFilter.filter(course => {
        const courseName = course.name?.toLowerCase() || '';
        const courseCode = course.courseCode?.toLowerCase() || '';
        const courseCodeNoSpaces = courseCode.replace(/\s+/g, '');
        
        return courseName.includes(searchTerm) ||
               courseCode.includes(searchTerm) ||
               courseCodeNoSpaces.includes(searchTermNoSpaces) ||
               courseCode.includes(searchTermNoSpaces);
      });
    }

    return coursesToFilter;
  }, [canManageAllCourses, allCoursesData, doctorCoursesData, studentCoursesData, debouncedSearch, isDoctor, isStudent]);

  // Calculate total records
  const totalRecords = useMemo(() => {
    if (canManageAllCourses) {
      return allCoursesData?.data?.total || 0;
    } else if (isDoctor && !canManageAllCourses) {
      return doctorCoursesData?.data?.length || 0;
    } else if (isStudent) {
      return studentCoursesData?.data?.total || 0;
    }
    return 0;
  }, [canManageAllCourses, allCoursesData, doctorCoursesData, studentCoursesData, isDoctor, isStudent]);

  const getPageTitle = () => {
    if (canManageAllCourses) return "All Courses";
    if (isDoctor) return "My Courses";
    if (isAssistant) return "My Assigned Courses";
    if (isStudent) return "My Enrolled Courses";
    return "Courses";
  };

  const getPageDescription = () => {
    if (canManageAllCourses) return "Manage all courses in the system";
    if (isDoctor) return "Courses you are assigned to teach";
    if (isAssistant) return "Courses you assist with";
    if (isStudent) return "Courses you are enrolled in";
    return "Course information";
  };

  // Show loading state only for initial load, not during search
  const isInitialLoading = isLoading && !(allCoursesData || doctorCoursesData || studentCoursesData);

  if (isInitialLoading) {
    return (
      <div className="panel mt-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="panel mt-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 text-lg font-semibold mb-2">Error loading courses</div>
          <div className="text-gray-600 mb-4">{error.message}</div>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel mt-6">
      <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
          <div>
            <h2 className="text-2xl font-semibold text-secondary">{getPageTitle()}</h2>
            <p className="text-gray-600 text-sm mt-1">{getPageDescription()}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search - Always visible and functional */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`form-input w-64 ${
                  isLoading && debouncedSearch && canManageAllCourses 
                    ? 'pr-16' 
                    : 'pr-10'
                }`}
                disabled={false} // Never disable search input
              />
              {/* Show loading spinner only when there's an active search and we're loading */}
              {isLoading && debouncedSearch && canManageAllCourses ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary"></div>
                </div>
              ) : (
                <LuSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              )}
            </div>
            
            {/* Add Course Button - Always visible when user has privileges */}
            {canManageAllCourses && (
              <button
                onClick={handleAddCourse}
                className="btn bg-secondary text-white hover:bg-secondary-dark flex items-center gap-2"
                disabled={false} // Never disable add button
              >
                <LuPlus size={16} />
                Add Course
              </button>
            )}
          </div>
        </div>
      </div>
      
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <LuEye size={48} className="text-gray-400 mb-4" />
          <div className="text-gray-600 text-lg font-semibold mb-2">
            {search ? "No courses found" : "No Courses Available"}
          </div>
          <div className="text-gray-500">
            {search ? "Try adjusting your search criteria." : 
             canManageAllCourses ? "Create your first course to get started." :
             "No courses have been assigned to you yet."}
          </div>
          {!search && canManageAllCourses && (
            <button
              onClick={handleAddCourse}
              className="mt-4 px-4 py-2 bg-secondary text-white rounded-md text-sm"
            >
              Add Course
            </button>
          )}
        </div>
      ) : (
        <div className="datatables">
          <DataTable
            highlightOnHover
            withBorder
            className="table-hover whitespace-nowrap cursor-pointer"
            records={filteredCourses}
            onRowClick={row => handleViewCourse(row.id)}
            columns={[
              { 
                accessor: "courseCode", 
                title: "Course Code",
                render: (row) => (
                  <span className="font-medium">{row.courseCode}</span>
                )
              },
              {
                accessor: "name",
                title: "Course Name",
                render: (row) => (
                  <span className="text-secondary hover:underline">
                    {row.name}
                  </span>
                ),
              },
              { 
                accessor: "courseType", 
                title: "Course Type",
                render: (row) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.courseType === "Practical" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {row.courseType}
                  </span>
                )
              },
              {
                accessor: "numberOfStudents",
                title: "Students Enrolled",
                render: (row) => (
                  <span className="font-medium">{row.numberOfStudents}</span>
                ),
              },
              {
                accessor: "creditHours",
                title: "Credit Hours",
                render: (row) => (
                  <span>{row.creditHours}</span>
                ),
              },
              {
                accessor: "assignedDoctors",
                title: "Assigned Doctors",
                render: (row) => (
                  <span className="text-sm text-gray-600">
                    {Array.isArray(row.assignedDoctors) ? row.assignedDoctors.join(", ") : row.assignedDoctors || "Not assigned"}
                  </span>
                ),
              },
            ]}
            totalRecords={totalRecords}
            recordsPerPage={pageSize}
            page={page + 1} // DataTable uses 1-based pagination
            onPageChange={(pageNumber) => setPage(pageNumber - 1)} // Convert back to 0-based
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={setPageSize}
          />
        </div>
      )}
      
      {canManageAllCourses && (
        <CourseDetailsModal
          isOpen={isAddCourseModalOpen}
          onClose={handleCloseModal}
          courseToEdit={courseToEdit}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default CoursesPage;
