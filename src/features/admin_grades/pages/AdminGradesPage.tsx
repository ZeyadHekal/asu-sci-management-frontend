import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import GradeDetailsModal from "../components/GradeDetailsModal";

const rowData = [
  {
    id: 1,
    course: "Operating Systems",
    studentName: "Hossam Hassan",
    studentID: "201913684",
    finalExam: "_",
    midtermExam: "B+",
    total: "B+",
  },
  {
    id: 2,
    course: "Data Structures",
    studentName: "Ali Ahmed",
    studentID: "201913685",
    finalExam: "_",
    midtermExam: "B",
    total: "B",
  },
  {
    id: 3,
    course: "Database Systems",
    studentName: "Sara Mohamed",
    studentID: "201913686",
    finalExam: "_",
    midtermExam: "B-",
    total: "B-",
  },
];

const AdminGradesPage = () => {
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState(rowData);
  const [recordsData, setRecordsData] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [isGradeDetailsModalOpen, setIsGradeDetailsModalOpen] = useState(false);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);

  useEffect(() => {
    setInitialRecords(() => {
      return rowData.filter((item) => {
        return (
          item.course.toLowerCase().includes(search.toLowerCase()) ||
          item.studentName.toLowerCase().includes(search.toLowerCase()) ||
          item.studentID.toLowerCase().includes(search.toLowerCase()) ||
          item.finalExam.toLowerCase().includes(search.toLowerCase()) ||
          item.midtermExam.toLowerCase().includes(search.toLowerCase()) ||
          item.total.toLowerCase().includes(search.toLowerCase())
        );
      });
    });
  }, [search]);

  return (
    <div className="panel mt-6">
      <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
          <h2 className="text-2xl font-semibold text-secondary">All Grades</h2>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex items-center flex-1 md:flex-auto">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <LuSearch size={20} className="text-[#0E1726]" />
              </div>
              <input
                type="text"
                placeholder="Course name or code"
                className="h-10 pl-10 pr-4 w-[240px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className="self-start h-10 p-3 rounded-lg bg-secondary flex items-center text-white"
              onClick={() => setIsGradeDetailsModalOpen(true)}
            >
              Add a New Grade
            </button>
          </div>
        </div>
      </div>
      <div className="datatables">
        <DataTable
          highlightOnHover
          withBorder
          className="table-hover whitespace-nowrap"
          records={recordsData}
          columns={[
            { accessor: "course", title: "Course" },
            { accessor: "studentName", title: "Student Name" },
            { accessor: "studentID", title: "Student ID" },
            { accessor: "finalExam", title: "Final Exam" },
            { accessor: "midtermExam", title: "Midterm Exam" },
            { accessor: "total", title: "Total" },
            {
              accessor: "status",
              title: "Status",
              render: () => (
                <div className="w-20 h-[22px] flex justify-center items-center rounded border border-success text-success text-xs font-semibold">
                  Pass
                </div>
              ),
            },
          ]}
          totalRecords={initialRecords.length}
          recordsPerPage={pageSize}
          onRecordsPerPageChange={setPageSize}
          page={page}
          onPageChange={(p) => setPage(p)}
          recordsPerPageOptions={PAGE_SIZES}
        />
      </div>

      <GradeDetailsModal
        isOpen={isGradeDetailsModalOpen}
        onClose={() => setIsGradeDetailsModalOpen(false)}
      />
    </div>
  );
};

export default AdminGradesPage;
