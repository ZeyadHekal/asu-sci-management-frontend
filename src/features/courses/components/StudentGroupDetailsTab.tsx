import { useState } from "react";
import { FaUsers, FaClipboardCheck, FaStar } from "react-icons/fa";
import { TbDeviceAnalytics } from "react-icons/tb";
import { DataTable } from "mantine-datatable";
import { useAuthStore } from "../../../store/authStore";
import { useStudentCourseControllerGetStudentGroupDetails } from "../../../generated/hooks/student-coursesHooks/useStudentCourseControllerGetStudentGroupDetails";
import { useStudentCourseControllerGetGroupStudents } from "../../../generated/hooks/student-coursesHooks/useStudentCourseControllerGetGroupStudents";
import { useQuery } from "@tanstack/react-query";
import { client } from "../../../global/api/apiClient";

interface GroupMember {
  id: string;
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
  courseId: string;
}

const StudentGroupDetailsTab = ({ courseId }: StudentGroupDetailsTabProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const user = useAuthStore((state) => state.user);

  // Get student's group details in this course
  const { 
    data: groupDetails, 
    isLoading: groupLoading,
    error: groupError 
  } = useStudentCourseControllerGetStudentGroupDetails(
    user?.id!, 
    courseId, 
    {
      query: {
        enabled: !!user?.id && !!courseId
      }
    }
  );

  // Get group members if we have a group
  const { 
    data: groupMembersData, 
    isLoading: membersLoading 
  } = useStudentCourseControllerGetGroupStudents(
    groupDetails?.data?.courseGroupId!, 
    {
      query: {
        enabled: !!groupDetails?.data?.courseGroupId
      }
    }
  );

  // Mock session data - this would need to be integrated with attendance/lab session backend
  const { data: sessionsData } = useQuery({
    queryKey: ['studentSessions', user?.id, courseId],
    queryFn: async () => {
      // TODO: Replace with real API call when lab sessions/attendance is implemented
      return [
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
        }
      ];
    },
    enabled: !!user?.id && !!courseId
  });

  const group = groupDetails?.data;
  const groupMembers: GroupMember[] = groupMembersData?.data?.map((member) => ({
    id: member.studentId || '',
    name: member.studentName || 'Unknown',
    email: member.email || '',
    studentId: member.studentId || '',
    attendanceRate: 85, // TODO: Calculate from real attendance data
    points: 78, // TODO: Calculate from real points data  
    isCurrentUser: member.studentId === user?.id
  })) || [];

  const sessions: Session[] = sessionsData || [];

  if (groupLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading group details...</div>
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-lg font-semibold mb-2">Group not found</div>
        <div className="text-gray-600">You may not be enrolled in this course or assigned to a group yet.</div>
      </div>
    );
  }

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
              <p className="text-xl font-semibold">{group.groupStudentsCount || 0}/{group.groupCapacity || 0}</p>
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
                {totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0}%
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
              <p className="text-gray-600 text-sm">Group Performance</p>
              <p className="text-xl font-semibold">{Math.round(groupMembers.reduce((sum, m) => sum + m.points, 0) / groupMembers.length) || 0}</p>
              <p className="text-sm text-gray-500">Average points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Group Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Group Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Group Name:</span>
                <span className="font-medium">{group.groupName || 'No Group'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lab:</span>
                <span className="font-medium">{group.labName || 'No Lab Assigned'}</span>
              </div>
              {group.labRoom && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">{group.labRoom}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Teaching Staff</h4>
            <div className="space-y-2 text-sm">
              {group.assignedDoctors && group.assignedDoctors.length > 0 ? (
                group.assignedDoctors.map((doctor, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">Instructor:</span>
                    <span className="font-medium">{doctor}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No instructors assigned</div>
              )}
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
      <div>
        {activeTab === "members" && (
          <div className="p-4">
            <div className="datatables">
              <DataTable
                records={groupMembers}
                columns={memberColumns}
                minHeight={200}
                fetching={membersLoading}
                emptyState={
                  <div className="flex flex-col items-center justify-center p-8">
                    <FaUsers size={48} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg font-medium mb-2">No Group Members</p>
                    <p className="text-gray-400 text-sm">This group has no members assigned yet.</p>
                  </div>
                }
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
                emptyState={
                  <div className="flex flex-col items-center justify-center p-8">
                    <FaClipboardCheck size={48} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg font-medium mb-2">No Sessions Yet</p>
                    <p className="text-gray-400 text-sm">Lab sessions will appear here once they begin.</p>
                  </div>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGroupDetailsTab; 