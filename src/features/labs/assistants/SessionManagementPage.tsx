import { useState, useEffect } from "react";
import { LuPlay, LuUsers, LuMonitor, LuUserCheck, LuUserX, LuPlus, LuAward, LuClock, LuRefreshCw } from "react-icons/lu";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";

// Mock data and interfaces for now since backend is not fully implemented
interface SessionDevice {
  deviceId: string;
  deviceName: string;
  isActive: boolean;
  currentUser?: {
    studentId: string;
    studentName: string;
    username: string;
  };
  loginTime?: Date;
}

interface SessionStudent {
  studentId: string;
  studentName: string;
  username: string;
  email: string;
  isPresent: boolean;
  assignedDevice?: {
    deviceId: string;
    deviceName: string;
  };
  attendancePoints: number;
  extraPoints: number;
}

interface ActiveSession {
  sessionId: string;
  course: {
    id: string;
    name: string;
    code: string;
  };
  group: {
    id: string;
    name: string;
    order: number;
  };
  lab: {
    id: string;
    name: string;
  };
  startTime: Date;
  expectedDuration: number;
  devices: SessionDevice[];
  students: SessionStudent[];
}

const SessionManagementPage = () => {
  const { user } = useAuthStore();
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [pointsToAward, setPointsToAward] = useState<number>(0);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAwardPointsModal, setShowAwardPointsModal] = useState(false);

  // Mock data for course groups assigned to the assistant
  const assignedGroups = [
    { id: "1", name: "CS101 - Group A", courseCode: "CS101", groupName: "Group A" },
    { id: "2", name: "CS102 - Group B", courseCode: "CS102", groupName: "Group B" },
    { id: "3", name: "CS201 - Group C", courseCode: "CS201", groupName: "Group C" },
  ];

  // Mock active session data
  const mockActiveSession: ActiveSession = {
    sessionId: "session-1",
    course: {
      id: "course-1",
      name: "Introduction to Programming",
      code: "CS101"
    },
    group: {
      id: "group-1",
      name: "Group A",
      order: 1
    },
    lab: {
      id: "lab-1",
      name: "Computer Lab 1"
    },
    startTime: new Date(),
    expectedDuration: 120,
    devices: [
      {
        deviceId: "device-1",
        deviceName: "PC-001",
        isActive: true,
        currentUser: {
          studentId: "student-1",
          studentName: "Ahmed Mohamed",
          username: "ahmed.mohamed"
        },
        loginTime: new Date()
      },
      {
        deviceId: "device-2",
        deviceName: "PC-002",
        isActive: true
      },
      {
        deviceId: "device-3",
        deviceName: "PC-003",
        isActive: false
      }
    ],
    students: [
      {
        studentId: "student-1",
        studentName: "Ahmed Mohamed",
        username: "ahmed.mohamed",
        email: "ahmed@example.com",
        isPresent: true,
        assignedDevice: {
          deviceId: "device-1",
          deviceName: "PC-001"
        },
        attendancePoints: 0,
        extraPoints: 0
      },
      {
        studentId: "student-2",
        studentName: "Fatima Ali",
        username: "fatima.ali",
        email: "fatima@example.com",
        isPresent: false,
        attendancePoints: -2,
        extraPoints: 0
      },
      {
        studentId: "student-3",
        studentName: "Omar Hassan",
        username: "omar.hassan",
        email: "omar@example.com",
        isPresent: true,
        attendancePoints: 0,
        extraPoints: 5
      }
    ]
  };

  const handleStartSession = async () => {
    if (!selectedGroup) {
      toast.error("Please select a course group");
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // await startLabSession({ courseGroupId: selectedGroup, sessionDateTime: new Date() });
      
      // Mock successful session start
      setTimeout(() => {
        setActiveSession(mockActiveSession);
        toast.success("Lab session started successfully!");
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error("Failed to start session");
      setLoading(false);
    }
  };

  const handleTakeAttendance = async (studentId: string, isPresent: boolean) => {
    try {
      // TODO: Replace with actual API call
      // await takeAttendance(activeSession!.sessionId, { studentId, isPresent, absencePoints: isPresent ? 0 : -2 });
      
      // Mock update
      if (activeSession) {
        const updatedStudents = activeSession.students.map(student => 
          student.studentId === studentId 
            ? { ...student, isPresent, attendancePoints: isPresent ? 0 : -2 }
            : student
        );
        setActiveSession({ ...activeSession, students: updatedStudents });
        toast.success(`Attendance updated for ${activeSession.students.find(s => s.studentId === studentId)?.studentName}`);
      }
    } catch (error) {
      toast.error("Failed to update attendance");
    }
  };

  const handleAwardPoints = async () => {
    if (!selectedStudent || pointsToAward === 0) {
      toast.error("Please select a student and enter points to award");
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await awardExtraPoints(activeSession!.sessionId, { studentId: selectedStudent, extraPoints: pointsToAward });
      
      // Mock update
      if (activeSession) {
        const updatedStudents = activeSession.students.map(student => 
          student.studentId === selectedStudent 
            ? { ...student, extraPoints: student.extraPoints + pointsToAward }
            : student
        );
        setActiveSession({ ...activeSession, students: updatedStudents });
        const studentName = activeSession.students.find(s => s.studentId === selectedStudent)?.studentName;
        toast.success(`Awarded ${pointsToAward} points to ${studentName}`);
        setShowAwardPointsModal(false);
        setSelectedStudent("");
        setPointsToAward(0);
      }
    } catch (error) {
      toast.error("Failed to award points");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getDeviceStatusColor = (device: SessionDevice) => {
    if (!device.isActive) return "bg-red-100 text-red-800";
    if (device.currentUser) return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getDeviceStatusText = (device: SessionDevice) => {
    if (!device.isActive) return "Inactive";
    if (device.currentUser) return "In Use";
    return "Available";
  };

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-light rounded-lg">
                <LuPlay className="text-primary" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
                <p className="text-gray-600">Start and manage lab sessions for your assigned groups</p>
              </div>
            </div>

            {/* Start Session Form */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Start New Lab Session</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course Group
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="">Choose a group...</option>
                    {assignedGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    className="form-input w-full"
                    disabled
                  />
                </div>
              </div>

              <button
                onClick={handleStartSession}
                disabled={!selectedGroup || loading}
                className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Starting Session...
                  </>
                ) : (
                  <>
                    <LuPlay size={16} />
                    Start Lab Session
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Assigned Groups Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Assigned Groups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedGroups.map(group => (
                <div key={group.id} className="p-4 border rounded-lg">
                  <h3 className="font-medium text-gray-900">{group.courseCode}</h3>
                  <p className="text-sm text-gray-600">{group.groupName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Session Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeSession.course.code} - {activeSession.group.name}
              </h1>
              <p className="text-gray-600">
                {activeSession.course.name} • {activeSession.lab.name}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <LuClock size={14} />
                  Started: {formatTime(activeSession.startTime)}
                </span>
                <span>Duration: {activeSession.expectedDuration} min</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAwardPointsModal(true)}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark flex items-center gap-2"
              >
                <LuAward size={16} />
                Award Points
              </button>
              <button
                onClick={() => setActiveSession(null)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                End Session
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <LuMonitor size={20} />
                Device Status ({activeSession.devices.length})
              </h2>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <LuRefreshCw size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {activeSession.devices.map(device => (
                <div key={device.deviceId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${device.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{device.deviceName}</h3>
                      {device.currentUser && (
                        <p className="text-sm text-gray-600">
                          {device.currentUser.studentName} ({device.currentUser.username})
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeviceStatusColor(device)}`}>
                    {getDeviceStatusText(device)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Attendance */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LuUsers size={20} />
              Student Attendance ({activeSession.students.length})
            </h2>

            <div className="space-y-3">
              {activeSession.students.map(student => (
                <div key={student.studentId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${student.isPresent ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{student.studentName}</h3>
                      <p className="text-sm text-gray-600">{student.username}</p>
                      {student.assignedDevice && (
                        <p className="text-xs text-blue-600">Device: {student.assignedDevice.deviceName}</p>
                      )}
                      <div className="flex gap-2 text-xs">
                        <span className={`${student.attendancePoints >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Attendance: {student.attendancePoints}
                        </span>
                        <span className="text-blue-600">Extra: +{student.extraPoints}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTakeAttendance(student.studentId, true)}
                      className={`p-2 rounded-lg ${student.isPresent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}
                      title="Mark Present"
                    >
                      <LuUserCheck size={16} />
                    </button>
                    <button
                      onClick={() => handleTakeAttendance(student.studentId, false)}
                      className={`p-2 rounded-lg ${!student.isPresent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-700'}`}
                      title="Mark Absent"
                    >
                      <LuUserX size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Award Points Modal */}
        {showAwardPointsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Award Extra Points</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="">Choose a student...</option>
                    {activeSession.students.map(student => (
                      <option key={student.studentId} value={student.studentId}>
                        {student.studentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points to Award
                  </label>
                  <input
                    type="number"
                    value={pointsToAward}
                    onChange={(e) => setPointsToAward(Number(e.target.value))}
                    className="form-input w-full"
                    min="1"
                    max="10"
                    placeholder="Enter points (1-10)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowAwardPointsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAwardPoints}
                  disabled={!selectedStudent || pointsToAward === 0}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark disabled:opacity-50"
                >
                  Award Points
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManagementPage; 