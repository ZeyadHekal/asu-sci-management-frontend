import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { cn } from "../../../global/utils/cn";
import LabDetailsModal from "../components/LabDetailsModal";

const rowData = [
  {
    id: 1,
    labName: "Lab B2-215",
    devicesCount: "10 Devices",
    location: "Building B - Floor 1",
    supervisor: "Eng. Ahmed Mostafa",
    status: "Available",
  },
  {
    id: 2,
    labName: "Lab B2-216",
    devicesCount: "10 Devices",
    location: "Building B - Floor 1",
    supervisor: "Eng. Ahmed Mostafa",
    status: "In Use",
  },
  {
    id: 3,
    labName: "Lab B2-217",
    devicesCount: "10 Devices",
    location: "Building B - Floor 1",
    supervisor: "Eng. Ahmed Mostafa",
    status: "Under Maintenance",
  },
];

const LabsPage = () => {
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState(rowData);
  const [recordsData, setRecordsData] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [isLabDetailsModalOpen, setIsLabDetailsModalOpen] = useState(false);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);

  useEffect(() => {
    setInitialRecords(() => {
      return rowData.filter((item) => {
        return (
          item.labName.toLowerCase().includes(search.toLowerCase()) ||
          item.location.toLowerCase().includes(search.toLowerCase()) ||
          item.supervisor.toLowerCase().includes(search.toLowerCase()) ||
          item.status.toLowerCase().includes(search.toLowerCase())
        );
      });
    });
  }, [search]);

  return (
    <div className="panel mt-6">
      <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
          <h2 className="text-2xl font-semibold text-secondary">All Labs</h2>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex items-center flex-1 md:flex-auto">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <LuSearch size={20} className="text-[#0E1726]" />
              </div>
              <input
                type="text"
                placeholder="Lab name"
                className="h-10 pl-10 pr-4 w-[240px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className="self-start h-10 p-3 rounded-lg bg-secondary flex items-center text-white"
              onClick={() => setIsLabDetailsModalOpen(true)}
            >
              Add a New Lab
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
            {
              accessor: "labName",
              title: "Lab Name",
              render: (row) => (
                <span className="text-secondary">{row.labName}</span>
              ),
            },
            { accessor: "devicesCount", title: "Devices Count" },
            { accessor: "location", title: "Location" },
            { accessor: "supervisor", title: "Supervisor" },
            {
              accessor: "status",
              title: "Status",
              render: (row) => (
                <div
                  className={cn(
                    "w-32 h-[22px] flex justify-center items-center rounded text-xs font-semibold",
                    {
                      "border border-success text-success":
                        row.status === "Available",
                      "border border-warning text-warning":
                        row.status === "In Use",
                      "border border-danger text-danger":
                        row.status === "Under Maintenance",
                    }
                  )}
                >
                  {row.status}
                </div>
              ),
            },
            {
              accessor: "actions",
              title: "Actions",
              render: () => (
                <div className="flex items-center gap-2">
                  <button>
                    <FaRegEdit size={20} className="text-[#0E1726]" />
                  </button>
                  <button>
                    <RiDeleteBinLine size={20} className="text-[#0E1726]" />
                  </button>
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

      <LabDetailsModal
        isOpen={isLabDetailsModalOpen}
        onClose={() => setIsLabDetailsModalOpen(false)}
      />
    </div>
  );
};

export default LabsPage;
