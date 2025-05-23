import { useState } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuEye, LuUsers } from "react-icons/lu";
import { useNavigate } from "react-router";
import { useStudentCourseControllerGetPaginated } from "../../../generated/hooks/student-coursesHooks/useStudentCourseControllerGetPaginated";

const StudentMyCoursesView = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  // Fetch student courses using the generated hook
  const { 
    data: coursesData, 
    isLoading, 
    error,
    refetch 
  } = useStudentCourseControllerGetPaginated({
    page,
    limit: pageSize,
  });

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

  const courses = coursesData?.data?.items || [];
  const totalRecords = coursesData?.data?.total || 0;

  return (
    <div className="panel mt-6">
      <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
          <h2 className="text-2xl font-semibold text-secondary">My Courses</h2>
        </div>
      </div>
      
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <LuUsers size={48} className="text-gray-400 mb-4" />
          <div className="text-gray-600 text-lg font-semibold mb-2">No Courses Found</div>
          <div className="text-gray-500">You are not enrolled in any courses yet.</div>
        </div>
      ) : (
        <div className="datatables">
          <DataTable
            highlightOnHover
            withBorder
            className="table-hover whitespace-nowrap cursor-pointer"
            records={courses}
            onRowClick={row => handleViewCourse(row.courseId)}
            columns={[
              {
                accessor: "courseName",
                title: "Course Name",
                render: (row) => (
                  <span className="text-secondary hover:underline font-medium">
                    {row.courseName}
                  </span>
                ),
              },
              { 
                accessor: "groupNumber", 
                title: "Group Number",
                render: (row) => (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-light text-primary">
                    Group {row.groupNumber}
                  </span>
                )
              },
              {
                accessor: "groupCapacity",
                title: "Group Capacity",
                render: (row) => (
                  <span>{row.groupCapacity} students</span>
                ),
              },
              {
                accessor: "actions",
                title: "Actions",
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewCourse(row.courseId);
                      }}
                      className="text-secondary hover:text-secondary-dark"
                      title="View course content"
                    >
                      <LuEye size={18} />
                    </button>
                  </div>
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
    </div>
  );
};

export default StudentMyCoursesView; 