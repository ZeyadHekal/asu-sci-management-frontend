import { useState, useEffect } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuEye } from "react-icons/lu";
import { useNavigate } from "react-router";
import { useCourseControllerGetMyCourses } from "../../../generated/hooks/coursesHooks/useCourseControllerGetMyCourses";
import { CourseListDto } from "../../../generated/types/CourseListDto";

const DoctorMyCoursesView = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Use the new endpoint to fetch courses where the current user is a doctor
  const { 
    data: coursesData, 
    isLoading, 
    error,
    refetch 
  } = useCourseControllerGetMyCourses();

  // Debug logging
  useEffect(() => {
    if (coursesData) {
      console.log("My courses data:", coursesData.data);
    }
    if (error) {
      console.error("Error fetching my courses:", error);
    }
  }, [coursesData, error]);

  const handleViewCourse = (courseId: string) => {
    navigate(`/my-courses/${courseId}`);
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

  const courses = coursesData?.data || [];
  
  // Filter courses based on search if needed
  const filteredCourses = search 
    ? courses.filter(course => 
        course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(search.toLowerCase())
      )
    : courses;

  return (
    <div className="panel mt-6">
      <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
          <h2 className="text-2xl font-semibold text-secondary">My Courses</h2>
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
          </div>
        </div>
      </div>
      
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <LuEye size={48} className="text-gray-400 mb-4" />
          <div className="text-gray-600 text-lg font-semibold mb-2">
            {search ? "No courses found" : "No Courses Assigned"}
          </div>
          <div className="text-gray-500">
            {search ? "Try adjusting your search criteria." : "You have not been assigned to teach any courses yet."}
          </div>
        </div>
      ) : (
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
                  {row.assignedDoctors.join(", ")}
                </span>
              ),
            },
            {
              accessor: "hasDefaultGroup",
              title: "Default Group",
              render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  row.hasDefaultGroup 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {row.hasDefaultGroup ? "Created" : "Pending"}
                </span>
              )
            },
            {
              accessor: "actions",
              title: "Actions",
              render: (row) => (
                <div className="flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewCourse(row.id);
                    }}
                    className="btn btn-sm bg-secondary text-white hover:bg-secondary-dark flex items-center gap-1"
                  >
                    <LuEye size={14} />
                    View
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
};

export default DoctorMyCoursesView; 