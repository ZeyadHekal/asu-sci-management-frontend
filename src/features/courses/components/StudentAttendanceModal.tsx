import { useState } from "react";
import Modal from "../../../ui/modal/Modal";
import { DataTable } from "mantine-datatable";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface AttendanceSession {
  id: string;
  date: string;
  attended: boolean;
  extraPoints: number;
}

interface StudentAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: number;
    name: string;
    studentId: string;
  } | null;
}

const StudentAttendanceModal = ({
  isOpen,
  onClose,
  student,
}: StudentAttendanceModalProps) => {
  // Mock attendance data - in a real app this would be fetched from an API
  const [attendanceSessions] = useState<AttendanceSession[]>([
    {
      id: "1",
      date: "2023-09-05",
      attended: true,
      extraPoints: 0,
    },
    {
      id: "2",
      date: "2023-09-12",
      attended: true,
      extraPoints: 1,
    },
    {
      id: "3",
      date: "2023-09-19",
      attended: false,
      extraPoints: 0,
    },
    {
      id: "4",
      date: "2023-09-26",
      attended: true,
      extraPoints: 0,
    },
    {
      id: "5",
      date: "2023-10-03",
      attended: true,
      extraPoints: 2,
    },
    {
      id: "6",
      date: "2023-10-10",
      attended: true,
      extraPoints: 0,
    },
    {
      id: "7",
      date: "2023-10-17",
      attended: false,
      extraPoints: 0,
    },
    {
      id: "8",
      date: "2023-10-24",
      attended: true,
      extraPoints: 0,
    },
    {
      id: "9",
      date: "2023-10-31",
      attended: true,
      extraPoints: 1,
    },
    {
      id: "10",
      date: "2023-11-07",
      attended: true,
      extraPoints: 0,
    },
    {
      id: "11",
      date: "2023-11-14",
      attended: true,
      extraPoints: 0,
    },
    {
      id: "12",
      date: "2023-11-21",
      attended: true,
      extraPoints: 0,
    },
  ]);

  // Calculate attendance statistics
  const totalSessions = attendanceSessions.length;
  const attendedSessions = attendanceSessions.filter(
    (session) => session.attended
  ).length;
  const totalExtraPoints = attendanceSessions.reduce(
    (sum, session) => sum + session.extraPoints,
    0
  );
  const attendanceRate = Math.round((attendedSessions / totalSessions) * 100);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${student.name}'s Attendance Record`}
      size="lg"
    >
      <div className="flex flex-col gap-6">
        {/* Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="text-gray-500 text-sm">Attendance Rate</div>
            <div className="text-2xl font-semibold text-secondary">
              {attendanceRate}%
            </div>
            <div className="text-xs text-gray-500">
              {attendedSessions} of {totalSessions} sessions
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="text-gray-500 text-sm">Missed Sessions</div>
            <div className="text-2xl font-semibold text-danger">
              {totalSessions - attendedSessions}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="text-gray-500 text-sm">Extra Points</div>
            <div className="text-2xl font-semibold text-success">
              {totalExtraPoints}
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="datatables">
          <DataTable
            highlightOnHover
            withBorder
            className="table-hover"
            records={attendanceSessions}
            columns={[
              {
                accessor: "date",
                title: "Session Date",
                render: (row) => formatDate(row.date),
              },
              {
                accessor: "attended",
                title: "Status",
                render: (row) => (
                  <div
                    className={`flex items-center gap-2 ${
                      row.attended ? "text-success" : "text-danger"
                    }`}
                  >
                    {row.attended ? (
                      <>
                        <FaCheckCircle />
                        <span>Present</span>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle />
                        <span>Absent</span>
                      </>
                    )}
                  </div>
                ),
              },
              {
                accessor: "extraPoints",
                title: "Extra Points",
                render: (row) => (
                  <span
                    className={
                      row.extraPoints > 0 ? "text-success font-medium" : ""
                    }
                  >
                    {row.extraPoints}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    </Modal>
  );
};

export default StudentAttendanceModal; 