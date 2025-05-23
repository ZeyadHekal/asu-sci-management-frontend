import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { FaArrowLeft, FaUsers, FaClock, FaCalendarAlt } from "react-icons/fa";
import { LuGraduationCap, LuPlus } from "react-icons/lu";
import { DataTable } from "mantine-datatable";
import { EventScheduleDto } from "../../../generated/types/EventScheduleDto";

// Mock event group data
const mockEventGroupData: EventScheduleDto & { 
  groupName: string; 
  enrolledStudents: number; 
  capacity: number;
  labName: string;
  eventName: string;
} = {
  id: "1",
  labId: "lab1",
  labName: "Lab A1-110",
  dateTime: new Date("2024-04-15T10:00:00"),
  examFiles: "midterm-files.zip",
  assisstantId: "ta1",
  groupName: "Group A",
  enrolledStudents: 18,
  capacity: 20,
  eventName: "Midterm Exam"
};

// Mock students data for this event group
const mockStudentsData = [
  {
    id: 1,
    name: "Ahmed Mohamed",
    studentId: "20201234",
    email: "ahmed.mohamed@example.com",
    attendanceStatus: "present",
    grade: 85
  },
  {
    id: 2,
    name: "Sara Ahmed", 
    studentId: "20205678",
    email: "sara.ahmed@example.com",
    attendanceStatus: "present",
    grade: 92
  },
  {
    id: 3,
    name: "Mohamed Ibrahim",
    studentId: "20209012", 
    email: "mohamed.ibrahim@example.com",
    attendanceStatus: "absent",
    grade: null
  },
  // Add more students...
];

const EventGroupDetailPage = () => {
  const { courseId, eventId, groupId } = useParams();
  const navigate = useNavigate();
  const [eventGroup, setEventGroup] = useState(mockEventGroupData);
  const [students, setStudents] = useState(mockStudentsData);

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric", 
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  return (
    <div className="panel mt-6">
      {/* Back Button & Header */}
      <div className="flex flex-col gap-4 mb-6">
        <button
          onClick={() => navigate(`/courses/${courseId}/events/${eventId}`)}
          className="flex items-center gap-1 text-secondary hover:text-secondary-dark self-start"
        >
          <FaArrowLeft size={14} />
          <span>Back to Event Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary">{eventGroup.groupName}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <span className="font-semibold">{eventGroup.eventName}</span>
              <span>•</span>
              <span>{eventGroup.labName}</span>
              <span>•</span>
              <span>{formatDateTime(eventGroup.dateTime)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-secondary text-white rounded-md text-sm">
              Take Attendance
            </button>
            <button className="px-4 py-2 border border-secondary text-secondary rounded-md text-sm">
              Add Grades
            </button>
          </div>
        </div>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Lab */}
        <div className="bg-white p-4 rounded-md border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gray-200 text-gray-700">
              <FaUsers size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Lab</p>
              <p className="text-lg font-semibold">{eventGroup.labName}</p>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white p-4 rounded-md border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary-light text-primary">
              <FaCalendarAlt size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Schedule</p>
              <p className="text-sm font-semibold">{formatDateTime(eventGroup.dateTime)}</p>
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="bg-white p-4 rounded-md border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-secondary-light text-secondary">
              <FaUsers size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Capacity</p>
              <p className="text-2xl font-semibold">{eventGroup.enrolledStudents}/{eventGroup.capacity}</p>
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white p-4 rounded-md border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-success-light text-success">
              <FaClock size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Attendance</p>
              <p className="text-2xl font-semibold">
                {Math.round((students.filter(s => s.attendanceStatus === 'present').length / students.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Students</h2>
        </div>

        <div className="panel">
          <DataTable
            highlightOnHover
            withBorder
            className="table-hover"
            records={students}
            columns={[
              {
                accessor: "studentId",
                title: "Student ID",
                width: 120,
              },
              {
                accessor: "name",
                title: "Student Name",
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 text-xs">
                        {row.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-gray-500">{row.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                accessor: "attendanceStatus",
                title: "Attendance",
                render: (row) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.attendanceStatus === 'present' 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {row.attendanceStatus === 'present' ? 'Present' : 'Absent'}
                  </span>
                ),
              },
              {
                accessor: "grade",
                title: "Grade",
                render: (row) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.grade !== null 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {row.grade !== null ? `${row.grade}/100` : 'Not graded'}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default EventGroupDetailPage; 