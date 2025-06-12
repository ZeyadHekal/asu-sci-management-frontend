import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { cn } from "../../../global/utils/cn";
import LabDetailsModal from "../components/LabDetailsModal";
import { useLabControllerGetPaginated } from "../../../generated/hooks/labsHooks/useLabControllerGetPaginated";
import { useLabControllerDelete } from "../../../generated/hooks/labsHooks/useLabControllerDelete";
import { useQueryClient } from "@tanstack/react-query";
import { labControllerGetPaginatedQueryKey } from "../../../generated/hooks/labsHooks/useLabControllerGetPaginated";
import toast from "react-hot-toast";
import type { LabListDto } from "../../../generated/types/LabListDto";

const LabsPage = () => {
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [search, setSearch] = useState("");
  const [isLabDetailsModalOpen, setIsLabDetailsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<LabListDto | null>(null);

  const queryClient = useQueryClient();

  // Fetch labs with pagination
  const { data: labsData, isLoading, error } = useLabControllerGetPaginated({
    page: page - 1, // API uses 0-based indexing
    limit: pageSize,
    // Note: Search functionality might need to be implemented differently based on API capabilities
  });

  // Delete lab mutation
  const deleteMutation = useLabControllerDelete({
    mutation: {
      onSuccess: () => {
        toast.success("Lab deleted successfully");
        queryClient.invalidateQueries({
          queryKey: labControllerGetPaginatedQueryKey(),
        });
      },
      onError: (error) => {
        toast.error("Failed to delete lab");
        console.error("Delete error:", error);
      },
    },
  });

  const handleDelete = async (labId: string) => {
    if (window.confirm("Are you sure you want to delete this lab?")) {
      deleteMutation.mutate({ lab_ids: labId });
    }
  };

  const handleEdit = (lab: LabListDto) => {
    setEditingLab(lab);
    setIsLabDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLabDetailsModalOpen(false);
    setEditingLab(null);
  };

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const labs = labsData?.data?.items || [];
  const totalRecords = labsData?.data?.total || 0;

  // Client-side filtering until backend supports search
  const filteredLabs = labs.filter((lab) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      lab.name.toLowerCase().includes(searchLower) ||
      lab.location.toLowerCase().includes(searchLower) ||
      (lab.supervisor?.name || "").toLowerCase().includes(searchLower) ||
      lab.status.toLowerCase().includes(searchLower)
    );
  });

  if (error) {
    return (
      <div className="panel mt-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-red-500">
            Error loading labs: {error?.message || "Please try again."}
          </div>
        </div>
      </div>
    );
  }

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
          records={filteredLabs}
          fetching={isLoading}
          columns={[
            {
              accessor: "name",
              title: "Lab Name",
              render: (row) => (
                <span className="text-secondary">{row.name}</span>
              ),
            },
            { 
              accessor: "deviceCount", 
              title: "Devices Count",
              render: (row) => `${row.deviceCount} Devices`
            },
            { accessor: "location", title: "Location" },
            { 
              accessor: "supervisor", 
              title: "Supervisor",
              render: (row) => row.supervisor ? row.supervisor.name : "N/A"
            },
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
              render: (row) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(row)}
                    disabled={deleteMutation.isPending}
                  >
                    <FaRegEdit size={20} className="text-[#0E1726] hover:text-secondary transition-colors" />
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <RiDeleteBinLine size={20} className="text-[#0E1726] hover:text-danger transition-colors" />
                  </button>
                </div>
              ),
            },
          ]}
          totalRecords={search ? filteredLabs.length : totalRecords}
          recordsPerPage={pageSize}
          onRecordsPerPageChange={setPageSize}
          page={page}
          onPageChange={(p) => setPage(p)}
          recordsPerPageOptions={PAGE_SIZES}
          minHeight={200}
        />
      </div>

      <LabDetailsModal
        isOpen={isLabDetailsModalOpen}
        onClose={handleCloseModal}
        editingLab={editingLab}
      />
    </div>
  );
};

export default LabsPage;
