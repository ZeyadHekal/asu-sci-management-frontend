import { useState } from "react";
import { FaUsers, FaPlus, FaEdit, FaTrash, FaUserPlus, FaCalendarAlt, FaClipboardCheck, FaStar, FaPlay, FaStop } from "react-icons/fa";
import { TbDeviceAnalytics } from "react-icons/tb";
import { DataTable } from "mantine-datatable";
import Modal from "../../../ui/modal/Modal";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../../store/authStore";
import { useCourseGroupControllerGetAssistantGroups } from "../../../generated/hooks/course-groupsHooks/useCourseGroupControllerGetAssistantGroups";
import { useStudentCourseControllerGetGroupStudents } from "../../../generated/hooks/student-coursesHooks/useStudentCourseControllerGetGroupStudents";

interface Group {
  id: string;
  groupName: string;
  studentsCount: number;
  maxCapacity: number;
  lastSession?: string;
  attendanceRate: number;
  averagePoints: number;
  isSessionActive?: boolean;
  labName: string;
  weekDay: string;
  timeSlot: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  attendanceCount: number;
  totalSessions: number;
  points: number;
  isPresent: boolean;
  deviceId?: string;
}

interface AssistantGroupsTabProps {
  courseId: string;
}

const AssistantGroupsTab = ({ courseId }: AssistantGroupsTabProps) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [sessionStudents, setSessionStudents] = useState<Student[]>([]);
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [pointsToAssign, setPointsToAssign] = useState<{[key: string]: number}>({});

  const user = useAuthStore((state) => state.user);

  // Get assistant's assigned groups in this course
  const { 
    data: assistantGroupsData, 
    isLoading: groupsLoading,
    error: groupsError 
  } = useCourseGroupControllerGetAssistantGroups(
    user?.id!, 
    courseId, 
    {
      query: {
        enabled: !!user?.id && !!courseId
      }
    }
  );

  // Get group students when a group is selected
  const { 
    data: groupStudentsData, 
    isLoading: studentsLoading 
  } = useStudentCourseControllerGetGroupStudents(
    selectedGroup?.id!, 
    {
      query: {
        enabled: !!selectedGroup?.id
      }
    }
  );

  const groups: Group[] = assistantGroupsData?.data?.map((group) => ({
    id: group.id || '',
    groupName: group.groupName || 'No Group',
    studentsCount: group.currentEnrollment || 0,
    maxCapacity: group.totalCapacity || 0,
    lastSession: "2024-01-15", // TODO: Get from real session data
    attendanceRate: 85, // TODO: Calculate from real attendance data
    averagePoints: 78, // TODO: Calculate from real points data
    isSessionActive: false, // TODO: Get from real session status
    labName: group.labName || 'No Lab',
    weekDay: group.weekDay || 'Not Scheduled',
    timeSlot: group.timeSlot || 'Not Scheduled'
  })) || [];

  const students: Student[] = groupStudentsData?.data?.map((student) => ({
    id: student.studentId || '',
    name: student.studentName || 'Unknown',
    email: student.email || '',
    studentId: student.studentId || '',
    attendanceCount: 8, // TODO: Get from real attendance data
    totalSessions: 10, // TODO: Get from real session data
    points: 85, // TODO: Get from real points data
    isPresent: true, // TODO: Get from current session status
    deviceId: "PC-001" // TODO: Get from device assignment
  })) || [];

  const handleStartSession = (group: Group) => {
    setSelectedGroup(group);
    setSessionStudents(students.map(s => ({ ...s, isPresent: false })));
    setShowSessionModal(true);
  };

  const handleEndSession = (group: Group) => {
    // TODO: Implement session ending logic
    toast.success(`Session ended for ${group.groupName}`);
  };

  const handleAssignPoints = (group: Group) => {
    setSelectedGroup(group);
    setPointsToAssign({});
    setShowPointsModal(true);
  };

  const handleAddStudent = () => {
    if (!newStudentEmail.trim()) {
      toast.error("Please enter a student email");
      return;
    }
    
    // TODO: Implement add student logic
    toast.success(`Student invitation sent to ${newStudentEmail}`);
    setNewStudentEmail("");
    setShowAddStudentModal(false);
  };

  const handleSaveAttendance = () => {
    // TODO: Implement save attendance logic
    const presentCount = sessionStudents.filter(s => s.isPresent).length;
    toast.success(`Attendance saved: ${presentCount}/${sessionStudents.length} students present`);
    setShowSessionModal(false);
  };

  const handleSavePoints = () => {
    // TODO: Implement save points logic
    const assignedCount = Object.keys(pointsToAssign).length;
    toast.success(`Points assigned to ${assignedCount} students`);
    setShowPointsModal(false);
  };

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading your assigned groups...</div>
      </div>
    );
  }

  if (groupsError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-lg font-semibold mb-2">Error loading groups</div>
        <div className="text-gray-600">There was an error loading your assigned groups.</div>
      </div>
    );
  }

  const groupColumns = [
    {
      accessor: "groupName",
      title: "Group Name",
      render: (row: Group) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary-light text-primary">
            <FaUsers size={16} />
          </div>
          <div>
            <div className="font-medium flex items-center gap-2">
              {row.groupName}
              {row.isSessionActive && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Session Active
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">{row.studentsCount}/{row.maxCapacity} students</div>
          </div>
        </div>
      )
    },
    {
      accessor: "labName",
      title: "Lab & Schedule",
      render: (row: Group) => (
        <div>
          <div className="font-medium">{row.labName}</div>
          <div className="text-sm text-gray-500">{row.weekDay} - {row.timeSlot}</div>
        </div>
      )
    },
    {
      accessor: "attendanceRate",
      title: "Attendance Rate",
      render: (row: Group) => (
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
      accessor: "averagePoints",
      title: "Average Points",
      render: (row: Group) => (
        <div className="flex items-center gap-1">
          <FaStar className="text-yellow-500" size={14} />
          <span className="font-medium">{row.averagePoints}</span>
        </div>
      )
    },
    {
      accessor: "lastSession",
      title: "Last Session",
      render: (row: Group) => (
        <span className="text-gray-600">
          {row.lastSession ? new Date(row.lastSession).toLocaleDateString() : "No sessions"}
        </span>
      )
    },
    {
      accessor: "actions",
      title: "Actions",
      render: (row: Group) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedGroup(row);
              setShowStudentModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
            title="View Students"
          >
            <FaUsers size={14} />
          </button>
          <button
            onClick={() => {
              setSelectedGroup(row);
              setShowAddStudentModal(true);
            }}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-md"
            title="Add Student"
          >
            <FaUserPlus size={14} />
          </button>
          {row.isSessionActive ? (
            <button
              onClick={() => handleEndSession(row)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              title="End Session"
            >
              <FaStop size={14} />
            </button>
          ) : (
            <button
              onClick={() => handleStartSession(row)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-md"
              title="Start Session"
            >
              <FaPlay size={14} />
            </button>
          )}
          <button
            onClick={() => handleAssignPoints(row)}
            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md"
            title="Assign Points"
          >
            <FaStar size={14} />
          </button>
        </div>
      )
    }
  ];

  const studentColumns = [
    {
      accessor: "name",
      title: "Student",
      render: (row: Student) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 text-xs">
              {row.name.split(" ").map(n => n[0]).join("")}
            </span>
          </div>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-gray-500">{row.studentId}</div>
          </div>
        </div>
      )
    },
    {
      accessor: "email",
      title: "Email",
      render: (row: Student) => (
        <span className="text-gray-600">{row.email}</span>
      )
    },
    {
      accessor: "attendanceCount",
      title: "Attendance",
      render: (row: Student) => (
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            (row.attendanceCount / row.totalSessions) >= 0.9 ? "bg-green-500" :
            (row.attendanceCount / row.totalSessions) >= 0.75 ? "bg-yellow-500" : "bg-red-500"
          }`}></div>
          <span className="font-medium">{row.attendanceCount}/{row.totalSessions}</span>
        </div>
      )
    },
    {
      accessor: "points",
      title: "Points",
      render: (row: Student) => (
        <div className="flex items-center gap-1">
          <FaStar className="text-yellow-500" size={14} />
          <span className="font-medium">{row.points}</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h3 className="text-lg font-semibold text-secondary">My Groups</h3>
          <p className="text-gray-600 text-sm">
            Manage your assigned groups, track attendance, and assign points
          </p>
        </div>
      </div>

      {/* Groups Table */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <FaUsers size={48} className="text-gray-400 mb-4" />
          <div className="text-gray-600 text-lg font-semibold mb-2">No Groups Assigned</div>
          <div className="text-gray-500">
            You haven't been assigned to any groups yet in this course
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <DataTable
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={groups}
            columns={groupColumns}
            fetching={groupsLoading}
          />
        </div>
      )}

      {/* Student List Modal */}
      <Modal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        title={`Students in ${selectedGroup?.groupName}`}
        size="lg"
      >
        <div className="space-y-4">
          <DataTable
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={students}
            columns={studentColumns}
            fetching={studentsLoading}
            emptyState={
              <div className="flex flex-col items-center justify-center p-8">
                <FaUsers size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">No Students</p>
                <p className="text-gray-400 text-sm">This group has no students assigned yet.</p>
              </div>
            }
          />
        </div>
      </Modal>

      {/* Session Management Modal */}
      <Modal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title={`Manage Session - ${selectedGroup?.groupName}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-blue-900">Active Session</h4>
              <p className="text-sm text-blue-700">Mark attendance for today's lab session</p>
            </div>
          </div>

          <div className="space-y-2">
            {sessionStudents.map((student, index) => (
              <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 text-xs">
                      {student.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.deviceId}</div>
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={student.isPresent}
                    onChange={(e) => {
                      const updatedStudents = [...sessionStudents];
                      updatedStudents[index].isPresent = e.target.checked;
                      setSessionStudents(updatedStudents);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">Present</span>
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowSessionModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAttendance}
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
            >
              Save Attendance
            </button>
          </div>
        </div>
      </Modal>

      {/* Points Assignment Modal */}
      <Modal
        isOpen={showPointsModal}
        onClose={() => setShowPointsModal(false)}
        title={`Assign Points - ${selectedGroup?.groupName}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Assign Points</h4>
            <p className="text-sm text-yellow-700">
              Assign points to students based on their performance in today's session
            </p>
          </div>

          <div className="space-y-3">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 text-xs">
                      {student.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-500">Current: {student.points} points</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="0"
                    value={pointsToAssign[student.id] || ''}
                    onChange={(e) => setPointsToAssign(prev => ({
                      ...prev,
                      [student.id]: parseInt(e.target.value) || 0
                    }))}
                    className="w-20 px-2 py-1 border rounded text-center"
                  />
                  <span className="text-sm text-gray-500">pts</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowPointsModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePoints}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Assign Points
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        title={`Add Student to ${selectedGroup?.groupName}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Email
            </label>
            <input
              type="email"
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-secondary focus:border-secondary"
              placeholder="student@example.com"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter the email address of the student you want to add to this group
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddStudent}
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
            >
              Send Invitation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssistantGroupsTab; 