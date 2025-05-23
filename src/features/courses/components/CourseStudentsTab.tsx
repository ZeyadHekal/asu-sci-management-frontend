import { useState, useEffect } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuClipboardCheck, LuFilter } from "react-icons/lu";
import { IoStatsChart } from "react-icons/io5";
import Select from "react-select";
import StudentAttendanceModal from "./StudentAttendanceModal";
import StudentGradesModal from "./StudentGradesModal";

interface CourseStudent {
  id: number;
  name: string;
  studentId: string;
  email: string;
  attendanceRate: number;
  totalGrade: number;
  groupId?: number;
  groupName?: string;
  department: string;
}

interface CourseStudentsTabProps {
  courseId: number;
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

  // Mock students data - would be fetched from API
  const [allStudents, setAllStudents] = useState<CourseStudent[]>([
    {
      id: 1,
      name: "Ahmed Mohamed",
      studentId: "20201234",
      email: "ahmed.mohamed@example.com",
      attendanceRate: 95,
      totalGrade: 80,
      groupId: 1,
      groupName: "Group A",
      department: "Computer Science",
    },
    {
      id: 2,
      name: "Sara Ahmed",
      studentId: "20205678",
      email: "sara.ahmed@example.com",
      attendanceRate: 90,
      totalGrade: 79,
      groupId: 1,
      groupName: "Group A",
      department: "Mathematics",
    },
    {
      id: 3,
      name: "Mohamed Ibrahim",
      studentId: "20209012",
      email: "mohamed.ibrahim@example.com",
      attendanceRate: 85,
      totalGrade: 71,
      groupId: 1,
      groupName: "Group A",
      department: "Computer Science",
    },
    {
      id: 4,
      name: "Fatma Ali",
      studentId: "20203456",
      email: "fatma.ali@example.com",
      attendanceRate: 100,
      totalGrade: 87,
      groupId: 1,
      groupName: "Group A",
      department: "Computer Science",
    },
    {
      id: 5,
      name: "Ali Hassan",
      studentId: "20207890",
      email: "ali.hassan@example.com",
      attendanceRate: 80,
      totalGrade: 75,
      groupId: 2,
      groupName: "Group B",
      department: "Statistics",
    },
    {
      id: 6,
      name: "Nour Khaled",
      studentId: "20208901",
      email: "nour.khaled@example.com",
      attendanceRate: 95,
      totalGrade: 79,
      groupId: 2,
      groupName: "Group B",
      department: "Mathematics",
    },
    {
      id: 7,
      name: "Khaled Mahmoud",
      studentId: "20202345",
      email: "khaled.mahmoud@example.com",
      attendanceRate: 90,
      totalGrade: 73,
      groupId: 2,
      groupName: "Group B",
      department: "Computer Science",
    },
    {
      id: 8,
      name: "Amal Samir",
      studentId: "20206789",
      email: "amal.samir@example.com",
      attendanceRate: 100,
      totalGrade: 84,
      groupId: 2,
      groupName: "Group B",
      department: "Physics",
    },
    {
      id: 9,
      name: "Hassan Omar",
      studentId: "20204321",
      email: "hassan.omar@example.com",
      attendanceRate: 88,
      totalGrade: 78,
      groupId: 3,
      groupName: "Group C",
      department: "Computer Science",
    },
    {
      id: 10,
      name: "Mariam Adel",
      studentId: "20208765",
      email: "mariam.adel@example.com",
      attendanceRate: 92,
      totalGrade: 82,
      groupId: 3,
      groupName: "Group C",
      department: "Statistics",
    },
    {
      id: 11,
      name: "Omar Youssef",
      studentId: "20201357",
      email: "omar.youssef@example.com",
      attendanceRate: 87,
      totalGrade: 76,
      groupId: 3,
      groupName: "Group C",
      department: "Mathematics",
    },
    {
      id: 12,
      name: "Laila Mostafa",
      studentId: "20207531",
      email: "laila.mostafa@example.com",
      attendanceRate: 93,
      totalGrade: 81,
      groupId: 3,
      groupName: "Group C",
      department: "Computer Science",
    },
    {
      id: 13,
      name: "Mahmoud Karim",
      studentId: "20208642",
      email: "mahmoud.karim@example.com",
      attendanceRate: 86,
      totalGrade: 77,
      groupId: 4,
      groupName: "Group D",
      department: "Physics",
    },
    {
      id: 14,
      name: "Heba Samy",
      studentId: "20203579",
      email: "heba.samy@example.com",
      attendanceRate: 94,
      totalGrade: 83,
      groupId: 4,
      groupName: "Group D",
      department: "Mathematics",
    },
    {
      id: 15,
      name: "Mostafa Adel",
      studentId: "20209753",
      email: "mostafa.adel@example.com",
      attendanceRate: 89,
      totalGrade: 80,
      groupId: 4,
      groupName: "Group D",
      department: "Computer Science",
    },
  ]);

  // States for filtered and paginated data
  const [filteredStudents, setFilteredStudents] = useState<CourseStudent[]>([]);
  const [paginatedStudents, setPaginatedStudents] = useState<CourseStudent[]>(
    []
  );

  // States for modals
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [gradesModalOpen, setGradesModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<CourseStudent | null>(
    null
  );

  // Get unique departments for filter
  const departmentOptions = [
    { value: "all", label: "All Departments" },
    ...Array.from(new Set(allStudents.map(student => student.department)))
      .map(dept => ({ value: dept, label: dept }))
  ];
  
  // Get unique groups for filter
  const groupOptions = [
    { value: "all", label: "All Groups" },
    ...Array.from(new Set(allStudents.map(student => student.groupName).filter(Boolean)))
      .map(group => ({ value: group as string, label: group as string }))
  ];

  // Apply search and filters
  useEffect(() => {
    let results = [...allStudents];
    
    // Apply search
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (student) =>
          student.name.toLowerCase().includes(searchLower) ||
          student.studentId.includes(search) ||
          student.email.toLowerCase().includes(searchLower) ||
          student.department.toLowerCase().includes(searchLower) ||
          (student.groupName &&
            student.groupName.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply department filter
    if (departmentFilter && departmentFilter.value !== "all") {
      results = results.filter(student => 
        student.department === departmentFilter.value
      );
    }
    
    // Apply group filter
    if (groupFilter && groupFilter.value !== "all") {
      results = results.filter(student => 
        student.groupName === groupFilter.value
      );
    }
    
    setFilteredStudents(results);
    setPage(1); // Reset to first page when filters change
  }, [search, allStudents, departmentFilter, groupFilter]);

  // Apply pagination
  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setPaginatedStudents(filteredStudents.slice(start, end));
  }, [page, pageSize, filteredStudents]);

  // Handle attendance button click
  const handleAttendanceClick = (student: CourseStudent) => {
    setSelectedStudent(student);
    setAttendanceModalOpen(true);
  };

  // Handle grades button click
  const handleGradesClick = (student: CourseStudent) => {
    setSelectedStudent(student);
    setGradesModalOpen(true);
  };

  // Reset filters
  const handleResetFilters = () => {
    setDepartmentFilter(null);
    setGroupFilter(null);
    setSearch("");
  };

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
                    <p className="text-xs text-gray-500">{row.email}</p>
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
                  {row.groupName || "Not Assigned"}
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
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        student={selectedStudent}
      />

      <StudentGradesModal
        isOpen={gradesModalOpen}
        onClose={() => setGradesModalOpen(false)}
        student={selectedStudent}
      />
    </div>
  );
};

export default CourseStudentsTab; 