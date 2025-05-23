import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";
import { useNavigate } from "react-router";
import CourseDetailsModal from "../components/CourseDetailsModal";
import { useCourseControllerGetPaginated } from "../../../generated/hooks/coursesHooks/useCourseControllerGetPaginated";
import { useCourseControllerDelete } from "../../../generated/hooks/coursesHooks/useCourseControllerDelete";
import { CourseListDto } from "../../../generated/types/CourseListDto";
import { toast } from "react-hot-toast";

const CoursesPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0); // API uses 0-based pagination
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [search, setSearch] = useState("");
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<{
    id?: number;
    courseCode: string;
    courseName: string;
    courseType: string;
    assignedDoctors: string;
    software: string;
  } | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch courses using the generated hook
  const { 
    data: coursesData, 
    isLoading, 
    error,
    refetch 
  } = useCourseControllerGetPaginated({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    sortBy: "created_at",
    sortOrder: "desc"
  });

  // Delete course mutation
  const { mutate: deleteCourse, isPending: isDeleting } = useCourseControllerDelete({
    mutation: {
      onSuccess: () => {
        toast.success("Course deleted successfully");
        refetch();
      },
      onError: (error: any) => {
        toast.error(`Failed to delete course: ${error?.response?.data?.message || "An error occurred"}`);
      }
    }
  });

  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleEditCourse = (course: CourseListDto, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    // Transform CourseListDto to the expected modal format
    setCourseToEdit({
      id: parseInt(course.id), // Convert string to number if needed
      courseCode: course.courseCode,
      courseName: course.name,
      courseType: course.courseType,
      assignedDoctors: course.assignedDoctors.join(", "),
      software: "N/A" // Default value since this field might not exist in API
    });
    setIsAddCourseModalOpen(true);
  };

  const handleDeleteCourse = (course: CourseListDto, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    
    if (window.confirm(`Are you sure you want to delete ${course.name}? This action cannot be undone.`)) {
      deleteCourse({
        course_ids: course.id
      });
    }
  };

  const handleCloseModal = () => {
    setCourseToEdit(null);
    setIsAddCourseModalOpen(false);
  };

  // Show loading state
  if (isLoading && !coursesData) {
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

  const courses = coursesData?.data?.items || [];
  const totalRecords = coursesData?.data?.total || 0;

  return (
    <div className="panel mt-6">
      <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
          <h2 className="text-2xl font-semibold text-secondary">All Courses</h2>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex items-center flex-1 md:flex-auto">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <LuSearch size={20} className="text-[#0E1726]" />
              </div>
              <input
                type="text"
                placeholder="Search courses by name or code"
                className="h-10 pl-10 pr-4 w-[240px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className="self-start h-10 p-3 rounded-lg bg-secondary flex items-center text-white"
              onClick={() => setIsAddCourseModalOpen(true)}
            >
              Add a New Course
            </button>
          </div>
        </div>
      </div>
      
      <div className="datatables">
        <DataTable
          highlightOnHover
          withBorder
          className="table-hover whitespace-nowrap cursor-pointer"
          records={courses}
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
              accessor: "assignedDoctors", 
              title: "Assigned Doctors",
              render: (row) => (
                <span>{row.assignedDoctors.join(", ") || "Not assigned"}</span>
              )
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
              title: "Number of Students",
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
              accessor: "actions",
              title: "Actions",
              render: (row) => (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => handleEditCourse(row, e)}
                    className="text-gray-500 hover:text-secondary"
                    disabled={isDeleting}
                  >
                    <FaRegEdit size={20} className="text-[#0E1726]" />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteCourse(row, e)}
                    className="text-gray-500 hover:text-red-500"
                    disabled={isDeleting}
                  >
                    <RiDeleteBinLine size={20} className="text-[#0E1726]" />
                  </button>
                </div>
              ),
            },
          ]}
          totalRecords={totalRecords}
          recordsPerPage={pageSize}
          onRecordsPerPageChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(0); // Reset to first page
          }}
          page={page + 1} // DataTable uses 1-based pagination for display
          onPageChange={(newPage) => setPage(newPage - 1)} // Convert back to 0-based
          recordsPerPageOptions={PAGE_SIZES}
          fetching={isLoading}
          noRecordsText="No courses found"
          emptyState={
            !isLoading && courses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg font-medium">No courses found</div>
                <div className="text-gray-400 text-sm mt-1">
                  {search ? 'Try adjusting your search term' : 'Create your first course to get started'}
                </div>
                {!search && (
                  <button
                    onClick={() => setIsAddCourseModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-secondary text-white rounded-md text-sm"
                  >
                    Add Course
                  </button>
                )}
              </div>
            ) : undefined
          }
        />
      </div>
      
      <CourseDetailsModal
        isOpen={isAddCourseModalOpen}
        onClose={handleCloseModal}
        courseToEdit={courseToEdit}
      />
    </div>
  );
};

export default CoursesPage;
