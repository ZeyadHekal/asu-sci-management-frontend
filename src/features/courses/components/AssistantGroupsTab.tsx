import { useState } from "react";
import { FaUsers, FaPlus, FaEdit, FaTrash, FaUserPlus, FaCalendarAlt, FaClipboardCheck, FaStar, FaPlay, FaStop } from "react-icons/fa";
import { TbDeviceAnalytics } from "react-icons/tb";
import { DataTable } from "mantine-datatable";
import Modal from "../../../ui/modal/Modal";
import { toast } from "react-hot-toast";

interface Group {
  id: number;
  name: string;
  studentsCount: number;
  maxCapacity: number;
  lastSession?: string;
  attendanceRate: number;
  averagePoints: number;
  isSessionActive?: boolean;
}

interface Student {
  id: number;
  name: string;
  email: string;
  studentId: string;
  attendanceCount: number;
  totalSessions: number;
  points: number;
  isPresent?: boolean;
  deviceId?: string;
}

interface AssistantGroupsTabProps {
  courseId: number;
}

const AssistantGroupsTab = ({ }: AssistantGroupsTabProps) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [sessionStudents, setSessionStudents] = useState<Student[]>([]);
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [pointsToAssign, setPointsToAssign] = useState<{[key: number]: number}>({});

  // Mock data - replace with actual API calls
  const groups: Group[] = [
    {
      id: 1,
      name: "Group A",
      studentsCount: 15,
      maxCapacity: 20,
      lastSession: "2024-01-15",
      attendanceRate: 85,
      averagePoints: 78,
      isSessionActive: false
    },
    {
      id: 2,
      name: "Group B",
      studentsCount: 18,
      maxCapacity: 20,
      lastSession: "2024-01-14",
      attendanceRate: 92,
      averagePoints: 82,
      isSessionActive: true
    }
  ];

  const students: Student[] = [
    {
      id: 1,
      name: "Ahmed Mohamed",
      email: "ahmed@example.com",
      studentId: "2021001",
      attendanceCount: 8,
      totalSessions: 10,
      points: 85,
      isPresent: true,
      deviceId: "PC-001"
    },
    {
      id: 2,
      name: "Sara Ali",
      email: "sara@example.com",
      studentId: "2021002",
      attendanceCount: 9,
      totalSessions: 10,
      points: 92,
      isPresent: false
    }
  ];

  const handleStartSession = (group: Group) => {
    setSelectedGroup(group);
    setSessionStudents(students.map(s => ({ ...s, isPresent: false })));
    setShowSessionModal(true);
  };

  const handleEndSession = (group: Group) => {
    if (window.confirm("Are you sure you want to end this session? Attendance will be recorded.")) {
      // Here you would call API to end session and save attendance
      toast.success("Session ended and attendance recorded");
    }
  };

  const handleToggleAttendance = (studentId: number) => {
    setSessionStudents(prev => 
      prev.map(s => 
        s.id === studentId ? { ...s, isPresent: !s.isPresent } : s
      )
    );
  };

  const handleSaveAttendance = () => {
    // Here you would call API to save attendance
    const presentStudents = sessionStudents.filter(s => s.isPresent);
    toast.success(`Attendance saved for ${presentStudents.length} students`);
    setShowSessionModal(false);
  };

  const handleAssignPoints = (group: Group) => {
    setSelectedGroup(group);
    setPointsToAssign({});
    setShowPointsModal(true);
  };

  const handleSavePoints = () => {
    // Here you would call API to save points
    const studentsWithPoints = Object.keys(pointsToAssign).length;
    toast.success(`Points assigned to ${studentsWithPoints} students`);
    setShowPointsModal(false);
  };

  const handleAddStudent = () => {
    if (!newStudentEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Here you would call API to add student to group
    toast.success(`Student with email ${newStudentEmail} added to group`);
    setNewStudentEmail("");
    setShowAddStudentModal(false);
  };

  const groupColumns = [
    {
      accessor: "name",
      title: "Group Name",
      render: (row: Group) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary-light text-primary">
            <FaUsers size={16} />
          </div>
          <div>
            <div className="font-medium flex items-center gap-2">
              {row.name}
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
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-gray-500">{row.studentId}</div>
        </div>
      )
    },
    {
      accessor: "attendance",
      title: "Attendance",
      render: (row: Student) => (
        <div>
          <div className="font-medium">{row.attendanceCount}/{row.totalSessions}</div>
          <div className="text-sm text-gray-500">
            {Math.round((row.attendanceCount / row.totalSessions) * 100)}%
          </div>
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

  const sessionStudentColumns = [
    {
      accessor: "name",
      title: "Student",
      render: (row: Student) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-gray-500">{row.studentId}</div>
        </div>
      )
    },
    {
      accessor: "device",
      title: "Device",
      render: (row: Student) => (
        <span className="text-sm">{row.deviceId || "Not assigned"}</span>
      )
    },
    {
      accessor: "attendance",
      title: "Present",
      render: (row: Student) => (
        <button
          onClick={() => handleToggleAttendance(row.id)}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            row.isPresent 
              ? "bg-green-100 text-green-800" 
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.isPresent ? "Present" : "Absent"}
        </button>
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
            You haven't been assigned to any groups yet
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <DataTable
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={groups}
            columns={groupColumns}
          />
        </div>
      )}

      {/* Student List Modal */}
      <Modal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        title={`Students in ${selectedGroup?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <DataTable
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={students}
            columns={studentColumns}
          />
        </div>
      </Modal>

      {/* Session Management Modal */}
      <Modal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title={`Session - ${selectedGroup?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Track Attendance</h4>
            <div className="text-sm text-gray-600">
              Present: {sessionStudents.filter(s => s.isPresent).length} / {sessionStudents.length}
            </div>
          </div>
          
          <DataTable
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={sessionStudents}
            columns={sessionStudentColumns}
          />
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowSessionModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
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
        title={`Assign Points - ${selectedGroup?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Assign points to students who are present</p>
          
          <div className="space-y-3">
            {students.filter(s => s.isPresent !== false).map(student => (
              <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-gray-500">{student.studentId}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Points:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-20 px-2 py-1 border rounded-md text-center"
                    value={pointsToAssign[student.id] || ""}
                    onChange={(e) => setPointsToAssign(prev => ({
                      ...prev,
                      [student.id]: parseInt(e.target.value) || 0
                    }))}
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowPointsModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePoints}
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
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
        title={`Add Student to ${selectedGroup?.name}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Enter student email address"
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">
              The student will be added to this group manually
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddStudent}
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
            >
              Add Student
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssistantGroupsTab; 