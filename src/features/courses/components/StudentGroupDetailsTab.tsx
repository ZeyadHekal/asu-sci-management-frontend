import { useState } from "react";
import { FaUsers, FaClipboardCheck, FaStar } from "react-icons/fa";
import { TbDeviceAnalytics } from "react-icons/tb";
import { DataTable } from "mantine-datatable";

interface GroupMember {
  id: number;
  name: string;
  email: string;
  studentId: string;
  attendanceRate: number;
  points: number;
  isCurrentUser?: boolean;
}

interface Session {
  id: number;
  date: string;
  type: string;
  duration: number;
  attended: boolean;
  pointsEarned: number;
  notes?: string;
}

interface StudentGroupDetailsTabProps {
  courseId: number;
}

const StudentGroupDetailsTab = ({ }: StudentGroupDetailsTabProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - replace with actual API calls
  const groupInfo = {
    id: 1,
    name: "Group A",
    capacity: 20,
    currentMembers: 15,
    assistantName: "Dr. Ahmed Hassan",
    assistantEmail: "ahmed.hassan@example.com",
    labRoom: "Lab 101",
    schedule: "Monday & Wednesday 10:00-12:00"
  };

  const groupMembers: GroupMember[] = [
    {
      id: 1,
      name: "Ahmed Mohamed",
      email: "ahmed@example.com",
      studentId: "2021001",
      attendanceRate: 85,
      points: 78,
      isCurrentUser: true
    },
    {
      id: 2,
      name: "Sara Ali",
      email: "sara@example.com",
      studentId: "2021002",
      attendanceRate: 92,
      points: 85
    },
    {
      id: 3,
      name: "Omar Hassan",
      email: "omar@example.com",
      studentId: "2021003",
      attendanceRate: 78,
      points: 72
    }
  ];

  const sessions: Session[] = [
    {
      id: 1,
      date: "2024-01-15",
      type: "Regular Lab",
      duration: 120,
      attended: true,
      pointsEarned: 8,
      notes: "Completed assignment on time"
    },
    {
      id: 2,
      date: "2024-01-13",
      type: "Project Work",
      duration: 120,
      attended: true,
      pointsEarned: 10,
      notes: "Excellent collaboration"
    },
    {
      id: 3,
      date: "2024-01-10",
      type: "Regular Lab",
      duration: 120,
      attended: false,
      pointsEarned: 0,
      notes: "Absent"
    }
  ];

  const memberColumns = [
    {
      accessor: "name",
      title: "Student",
      render: (row: GroupMember) => (
        <div className="flex items-center gap-2">
          {row.isCurrentUser && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
          <div>
            <div className={`font-medium ${row.isCurrentUser ? 'text-green-600' : ''}`}>
              {row.name} {row.isCurrentUser && '(You)'}
            </div>
            <div className="text-sm text-gray-500">{row.studentId}</div>
          </div>
        </div>
      )
    },
    {
      accessor: "attendanceRate",
      title: "Attendance",
      render: (row: GroupMember) => (
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            row.attendanceRate >= 90 ? "bg-green-500" :
            row.attendanceRate >= 75 ? "bg-yellow-500" : "bg-red-500"
          }`}></div>
          <span className="font-medium">{row.attendanceRate}%</span>
        </div>
      )
    },
    {
      accessor: "points",
      title: "Points",
      render: (row: GroupMember) => (
        <div className="flex items-center gap-1">
          <FaStar className="text-yellow-500" size={14} />
          <span className="font-medium">{row.points}</span>
        </div>
      )
    }
  ];

  const sessionColumns = [
    {
      accessor: "date",
      title: "Date",
      render: (row: Session) => (
        <div>
          <div className="font-medium">{new Date(row.date).toLocaleDateString()}</div>
          <div className="text-sm text-gray-500">{row.type}</div>
        </div>
      )
    },
    {
      accessor: "duration",
      title: "Duration",
      render: (row: Session) => (
        <span className="text-gray-600">{row.duration} min</span>
      )
    },
    {
      accessor: "attended",
      title: "Attendance",
      render: (row: Session) => (
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            row.attended ? "bg-green-500" : "bg-red-500"
          }`}></div>
          <span className={`font-medium ${
            row.attended ? "text-green-600" : "text-red-600"
          }`}>
            {row.attended ? "Present" : "Absent"}
          </span>
        </div>
      )
    },
    {
      accessor: "pointsEarned",
      title: "Points Earned",
      render: (row: Session) => (
        <div className="flex items-center gap-1">
          <FaStar className="text-yellow-500" size={14} />
          <span className="font-medium">{row.pointsEarned}</span>
        </div>
      )
    },
    {
      accessor: "notes",
      title: "Notes",
      render: (row: Session) => (
        <span className="text-gray-600 text-sm">{row.notes || "-"}</span>
      )
    }
  ];

  const currentUser = groupMembers.find(member => member.isCurrentUser);
  const totalSessions = sessions.length;
  const attendedSessions = sessions.filter(s => s.attended).length;
  const totalPoints = sessions.reduce((sum, s) => sum + s.pointsEarned, 0);

  return (
    <div className="space-y-6">
      {/* Group Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary-light text-primary">
              <FaUsers size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Group Members</p>
              <p className="text-xl font-semibold">{groupInfo.currentMembers}/{groupInfo.capacity}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaClipboardCheck size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">My Attendance</p>
              <p className="text-xl font-semibold">{attendedSessions}/{totalSessions}</p>
              <p className="text-sm text-gray-500">
                {Math.round((attendedSessions / totalSessions) * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaStar size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">My Points</p>
              <p className="text-xl font-semibold">{totalPoints}</p>
              <p className="text-sm text-gray-500">Total earned</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TbDeviceAnalytics size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Lab Room</p>
              <p className="text-xl font-semibold">{groupInfo.labRoom}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Group Information */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">{groupInfo.name} - Information</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Assistant Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{groupInfo.assistantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{groupInfo.assistantEmail}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Schedule Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Schedule:</span>
                  <span className="font-medium">{groupInfo.schedule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lab Room:</span>
                  <span className="font-medium">{groupInfo.labRoom}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 font-medium text-sm rounded-t-md transition ${
              activeTab === "members"
                ? "text-secondary border-b-2 border-secondary"
                : "text-gray-500 hover:text-secondary"
            }`}
          >
            Group Members
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2 font-medium text-sm rounded-t-md transition ${
              activeTab === "sessions"
                ? "text-secondary border-b-2 border-secondary"
                : "text-gray-500 hover:text-secondary"
            }`}
          >
            Session History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border">
        {activeTab === "members" && (
          <div className="p-4">
            <div className="datatables">
              <DataTable
                records={groupMembers}
                columns={memberColumns}
                minHeight={200}
              />
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="p-4">
            <div className="datatables">
              <DataTable
                records={sessions}
                columns={sessionColumns}
                minHeight={200}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGroupDetailsTab; 