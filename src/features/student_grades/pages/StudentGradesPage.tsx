import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { LuSearch, LuCalendar } from "react-icons/lu";
import Select from "react-select";

// Mock data for student grades with generic assessment types
const mockGradesData = [
  {
    id: 1,
    courseCode: "CS258",
    courseName: "Operating Systems",
    assessmentType: "Quiz",
    mark: 18,
    maxMark: 20,
    date: "2023-10-15",
  },
  {
    id: 2,
    courseCode: "CS258",
    courseName: "Operating Systems",
    assessmentType: "Midterm",
    mark: 42,
    maxMark: 50,
    date: "2023-11-20",
  },
  {
    id: 3,
    courseCode: "CS258",
    courseName: "Operating Systems",
    assessmentType: "Assignment",
    mark: 15,
    maxMark: 15,
    date: "2023-12-05",
  },
  {
    id: 4,
    courseCode: "CS259",
    courseName: "Data Structures",
    assessmentType: "Quiz",
    mark: 16,
    maxMark: 20,
    date: "2023-10-10",
  },
  {
    id: 5,
    courseCode: "CS259",
    courseName: "Data Structures",
    assessmentType: "Midterm",
    mark: 39,
    maxMark: 50,
    date: "2023-11-15",
  },
  {
    id: 6,
    courseCode: "CS260",
    courseName: "Database Systems",
    assessmentType: "Assignment",
    mark: 14,
    maxMark: 15,
    date: "2023-10-25",
  },
  {
    id: 7,
    courseCode: "CS260",
    courseName: "Database Systems",
    assessmentType: "Practical Exam",
    mark: 22,
    maxMark: 30,
    date: "2023-11-30",
  },
  {
    id: 8,
    courseCode: "CS260",
    courseName: "Database Systems",
    assessmentType: "Attendance",
    mark: 9,
    maxMark: 10,
    date: "2023-12-15",
  },
  {
    id: 9,
    courseCode: "MTH224",
    courseName: "Discrete Mathematics",
    assessmentType: "Midterm",
    mark: 34,
    maxMark: 40,
    date: "2023-11-05",
  },
  {
    id: 10,
    courseCode: "MTH224",
    courseName: "Discrete Mathematics",
    assessmentType: "Final",
    mark: 48,
    maxMark: 60,
    date: "2024-01-15",
  },
  {
    id: 11,
    courseCode: "CS361",
    courseName: "Artificial Intelligence",
    assessmentType: "Project",
    mark: 27,
    maxMark: 30,
    date: "2024-02-20",
  },
  {
    id: 12,
    courseCode: "CS361",
    courseName: "Artificial Intelligence",
    assessmentType: "Midterm",
    mark: 43,
    maxMark: 50,
    date: "2024-03-15",
  }
];

const assessmentTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "Quiz", label: "Quiz" },
  { value: "Midterm", label: "Midterm" },
  { value: "Assignment", label: "Assignment" },
  { value: "Final", label: "Final" },
  { value: "Project", label: "Project" },
  { value: "Practical Exam", label: "Practical Exam" },
  { value: "Attendance", label: "Attendance" }
];

// Get a list of unique courses for the filter
const courseOptions = [
  { value: "all", label: "All Courses" },
  ...Array.from(new Set(mockGradesData.map(grade => grade.courseCode))).map(code => {
    const course = mockGradesData.find(grade => grade.courseCode === code);
    return {
      value: code,
      label: `${code} - ${course?.courseName}`
    };
  })
];

const StudentGradesPage = () => {
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [search, setSearch] = useState("");
  const [filteredGrades, setFilteredGrades] = useState(mockGradesData);
  const [paginatedGrades, setPaginatedGrades] = useState<typeof mockGradesData>([]);

  // Filters
  const [courseFilter, setCourseFilter] = useState({ value: "all", label: "All Courses" });
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState({ value: "all", label: "All Types" });

  // Apply filters and search
  useEffect(() => {
    let filtered = [...mockGradesData];

    if (courseFilter.value !== "all") {
      filtered = filtered.filter(grade => grade.courseCode === courseFilter.value);
    }

    if (assessmentTypeFilter.value !== "all") {
      filtered = filtered.filter(grade => grade.assessmentType === assessmentTypeFilter.value);
    }

    // Apply search
    if (search) {
      filtered = filtered.filter(grade =>
        grade.courseName.toLowerCase().includes(search.toLowerCase()) ||
        grade.courseCode.toLowerCase().includes(search.toLowerCase()) ||
        grade.assessmentType.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredGrades(filtered);
    setPage(1);
  }, [search, courseFilter, assessmentTypeFilter]);

  // Handle pagination
  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setPaginatedGrades(filteredGrades.slice(from, to));
  }, [page, pageSize, filteredGrades]);

  return (
    <div className="panel mt-6">
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
          <h2 className="text-2xl font-semibold text-secondary">My Grades</h2>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex items-center">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <LuSearch size={18} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search grades..."
                className="h-10 pl-10 pr-4 w-[200px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Course</label>
            <Select
              options={courseOptions}
              value={courseFilter}
              onChange={(option) => option && setCourseFilter(option)}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Assessment Type</label>
            <Select
              options={assessmentTypeOptions}
              value={assessmentTypeFilter}
              onChange={(option) => option && setAssessmentTypeFilter(option)}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="datatables">
        <DataTable
          highlightOnHover
          withBorder
          className="table-hover whitespace-nowrap"
          records={paginatedGrades}
          columns={[
            {
              accessor: "courseInfo",
              title: "Course",
              sortable: true,
              render: ({ courseCode, courseName }) => (
                <div className="flex flex-col">
                  <span className="font-medium">{courseCode}</span>
                  <span className="text-xs text-gray-500">{courseName}</span>
                </div>
              ),
            },
            {
              accessor: "assessmentType",
              title: "Assessment Type",
              sortable: true,
              render: (row) => <span>{row.assessmentType}</span>,
            },
            {
              accessor: "mark",
              title: "Mark",
              sortable: true,
              render: (row) => (
                <div className="font-medium">
                  {row.mark} / {row.maxMark}
                </div>
              )
            },
            {
              accessor: "date",
              title: "Date",
              sortable: true,
              render: (row) => (
                <div className="flex items-center">
                  <LuCalendar className="mr-2 text-gray-500" />
                  {new Date(row.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              ),
            },
          ]}
          totalRecords={filteredGrades.length}
          recordsPerPage={pageSize}
          onRecordsPerPageChange={setPageSize}
          page={page}
          onPageChange={(p) => setPage(p)}
          recordsPerPageOptions={PAGE_SIZES}
          noRecordsText="No grades found"
        />
      </div>
    </div>
  );
};

export default StudentGradesPage;
