import { useState, useEffect, useMemo } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuClipboardCheck, LuFilter } from "react-icons/lu";
import { IoStatsChart } from "react-icons/io5";
import Select from "react-select";
import StudentAttendanceModal from "./StudentAttendanceModal";
import StudentGradesModal from "./StudentGradesModal";
import { useStudentCourseControllerGetCourseStudents } from "../../../generated/hooks/student-coursesHooks/useStudentCourseControllerGetCourseStudents";

interface CourseStudent {
  id: number;
  name: string;
  studentId: string;
  username: string;
  email: string;
  attendanceRate: number;
  totalGrade: number;
  groupId?: number;
  groupName?: string;
  department: string;
}

interface CourseStudentsTabProps {
  courseId: string;
}

const CourseStudentsTab = ({ courseId }: CourseStudentsTabProps) => {
  // States for pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZES = [10, 20, 30, 50];

  // State for search
  const [search, setSearch] = useState("");

  // States for filters
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<{value: string, label: string} | null>(null);
  const [groupFilter, setGroupFilter] = useState<{value: string, label: string} | null>(null);

  // States for modals
  const [selectedStudent, setSelectedStudent] = useState<CourseStudent | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);

  // Fetch students for this course using the generated hook
  const { 
    data: studentsData, 
    isLoading, 
    error,
    refetch 
  } = useStudentCourseControllerGetCourseStudents(courseId, {
    query: {
      enabled: !!courseId
    }
  });

  const allStudents = studentsData?.data || [];

  // Transform API data to CourseStudent interface
  const transformedStudents: CourseStudent[] = useMemo(() => {
    return allStudents.map((student, index) => ({
      id: index + 1, // Mock ID since API doesn't provide it
      name: student.studentName,
      studentId: student.studentId,
      username: student.username || 'N/A',
      email: student.email || `${student.username}@example.com`, // Use real email or fallback to username
      attendanceRate: Math.floor(Math.random() * 21) + 80, // Mock attendance rate (80-100%)
      totalGrade: Math.floor(Math.random() * 31) + 70, // Mock total grade (70-100)
      groupId: student.groupOrder,
      groupName: student.groupName || `Group ${student.groupOrder}`,
      department: ["Computer Science", "Mathematics", "Physics", "Statistics"][Math.floor(Math.random() * 4)], // Mock department
    }));
  }, [allStudents]);

  // States for filtered and paginated data
  const [filteredStudents, setFilteredStudents] = useState<CourseStudent[]>([]);
  const [paginatedStudents, setPaginatedStudents] = useState<CourseStudent[]>([]);

  // Filter options
  const departmentOptions = useMemo(
    () => [
      { value: "all", label: "All Departments" },
      ...Array.from(new Set(transformedStudents.map(s => s.department)))
        .map(dept => ({ value: dept, label: dept }))
    ],
    [transformedStudents]
  );

  const groupOptions = useMemo(
    () => [
      { value: "all", label: "All Groups" },
      ...Array.from(new Set(transformedStudents.map(s => s.groupName)))
        .map(group => ({ value: group, label: group }))
    ],
    [transformedStudents]
  );

  // Apply search and filters
  useEffect(() => {
    let results = [...transformedStudents];
    
    // Apply search
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      results = results.filter(student =>
        student.name.toLowerCase().includes(searchLower) ||
        student.studentId.toLowerCase().includes(searchLower) ||
        student.username.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply department filter
    if (departmentFilter && departmentFilter.value !== "all") {
      results = results.filter(student => student.department === departmentFilter.value);
    }
    
    // Apply group filter
    if (groupFilter && groupFilter.value !== "all") {
      results = results.filter(student => student.groupName === groupFilter.value);
    }
    
    setFilteredStudents(results);
    setPage(1); // Reset to first page when filters change
  }, [search, transformedStudents, departmentFilter, groupFilter]);

  // Apply pagination
  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setPaginatedStudents(filteredStudents.slice(start, end));
  }, [page, pageSize, filteredStudents]);

  // Handle attendance button click
  const handleAttendanceClick = (student: CourseStudent) => {
    setSelectedStudent(student);
    setIsAttendanceModalOpen(true);
  };

  // Handle grades button click
  const handleGradesClick = (student: CourseStudent) => {
    setSelectedStudent(student);
    setIsGradesModalOpen(true);
  };

  // Reset filters
  const handleResetFilters = () => {
    setDepartmentFilter(null);
    setGroupFilter(null);
    setSearch("");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 text-lg font-semibold mb-2">Error loading students</div>
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
    <div className="flex flex-col gap-6">
      {/* Search and Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <LuSearch size={20} className="text-[#0E1726]" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              className="h-10 pl-10 pr-4 w-full md:w-[300px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
              isFilterOpen || departmentFilter || groupFilter
                ? "bg-secondary text-white border-secondary"
                : "border-gray-300 text-gray-700"
            }`}
          >
            <LuFilter size={18} />
            <span>Filter</span>
            {(departmentFilter || groupFilter) && (
              <span className="bg-white text-secondary rounded-full w-5 h-5 flex items-center justify-center text-xs ml-1">
                {(departmentFilter ? 1 : 0) + (groupFilter ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-secondary text-white rounded-md text-sm">
            Add Students
          </button>
          <button className="px-4 py-2 border border-secondary text-secondary rounded-md text-sm">
            Export List
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-gray-50 p-4 rounded-md border">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="w-full md:w-[250px]">
              <label className="text-sm font-medium mb-1 block">Department</label>
              <Select
                options={departmentOptions}
                value={departmentFilter}
                onChange={setDepartmentFilter}
                placeholder="Select department..."
                isClearable
                classNamePrefix="react-select"
              />
            </div>
            
            <div className="w-full md:w-[250px]">
              <label className="text-sm font-medium mb-1 block">Group</label>
              <Select
                options={groupOptions}
                value={groupFilter}
                onChange={setGroupFilter}
                placeholder="Select group..."
                isClearable
                classNamePrefix="react-select"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-secondary"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="datatables">
        <DataTable
          highlightOnHover
          withBorder
          className="table-hover"
          records={paginatedStudents}
          totalRecords={filteredStudents.length}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={(p) => setPage(p)}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={setPageSize}
          columns={[
            {
              accessor: "studentId",
              title: "Student ID",
              width: 120,
            },
            {
              accessor: "name",
              title: "Student Name",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 text-xs">
                      {row.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-gray-500">@{row.username}</p>
                  </div>
                </div>
              ),
            },
            {
              accessor: "department",
              title: "Department",
              render: (row) => (
                <span className="text-gray-700">{row.department}</span>
              ),
            },
            {
              accessor: "groupName",
              title: "Group",
              render: (row) => (
                <span
                  className={
                    row.groupName ? "text-secondary font-medium" : "text-gray-400"
                  }
                >
                  {row.groupName || "No Group"}
                </span>
              ),
            },
            {
              accessor: "attendanceRate",
              title: "Attendance",
              render: (row) => (
                <button
                  onClick={() => handleAttendanceClick(row)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-3xl bg-primary-light text-primary text-xs font-medium hover:bg-primary-light/70 transition-colors"
                >
                  <LuClipboardCheck size={14} />
                  <span>{row.attendanceRate}%</span>
                </button>
              ),
            },
            {
              accessor: "totalGrade",
              title: "Grades",
              render: (row) => (
                <button
                  onClick={() => handleGradesClick(row)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-3xl bg-secondary-light text-secondary text-xs font-medium hover:bg-secondary-light/70 transition-colors"
                >
                  <IoStatsChart size={14} />
                  <span>{row.totalGrade}/100</span>
                </button>
              ),
            },
          ]}
        />
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <LuSearch size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No students found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Modals */}
      <StudentAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        student={selectedStudent}
      />

      <StudentGradesModal
        isOpen={isGradesModalOpen}
        onClose={() => setIsGradesModalOpen(false)}
        student={selectedStudent}
      />
    </div>
  );
};

export default CourseStudentsTab; 