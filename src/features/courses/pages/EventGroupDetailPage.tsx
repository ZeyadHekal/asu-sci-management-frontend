import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { FaArrowLeft, FaUsers, FaClock, FaCalendarAlt } from "react-icons/fa";
import { DataTable } from "mantine-datatable";
import { useEventGroupControllerGetEventGroups } from "../../../generated/hooks/event-groupsHooks/useEventGroupControllerGetEventGroups";
import { useEventGroupControllerGetEventGroupStudents } from "../../../generated/hooks/event-groupsHooks/useEventGroupControllerGetEventGroupStudents";
import { EventGroupDto } from "../../../generated/types/EventGroupDto";
import { EventGroupStudentDto } from "../../../generated/types/EventGroupStudentDto";

const EventGroupDetailPage = () => {
  const { courseId, eventId, groupId } = useParams();
  const navigate = useNavigate();

  // API hooks - get all groups for the event and find the specific one
  const { data: eventGroupsData, isLoading: groupsLoading, error: groupsError } = useEventGroupControllerGetEventGroups(
    eventId || '',
    {
      query: {
        enabled: !!eventId
      }
    }
  );

  const { data: studentsData, isLoading: studentsLoading, error: studentsError } = useEventGroupControllerGetEventGroupStudents(
    groupId || '',
    {
      query: {
        enabled: !!groupId
      }
    }
  );

  const eventGroups = (eventGroupsData?.data as EventGroupDto[]) || [];
  const eventGroup = eventGroups.find(group => group.id === groupId);
  const students = (studentsData?.data as EventGroupStudentDto[]) || [];

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric", 
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(date));
  };

  if (groupsLoading || studentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Loading group details...</span>
      </div>
    );
  }

  if (groupsError || !eventGroup) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error Loading Group</h3>
          <p className="text-red-600 text-sm mt-1">
            {groupsError ? 'Failed to load group data' : 'Group not found'}
          </p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-secondary">Event Group</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <span className="font-semibold">{eventGroup.labName}</span>
              <span>•</span>
              <span>{formatDateTime(eventGroup.dateTime)}</span>
              <span>•</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                eventGroup.autoStart 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {eventGroup.autoStart ? 'Auto Start Enabled' : 'Manual Start'}
              </span>
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
              <p className="text-2xl font-semibold">{eventGroup.enrolledStudents}/{eventGroup.maxStudents}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white p-4 rounded-md border shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${
              eventGroup.status === 'started' 
                ? 'bg-green-100 text-green-600'
                : eventGroup.status === 'scheduled'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              <FaClock size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Status</p>
              <p className="text-lg font-semibold capitalize">{eventGroup.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium">Students ({students.length})</h2>
        </div>

        {studentsError ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-red-800 font-medium">Error Loading Students</h3>
              <p className="text-red-600 text-sm mt-1">Failed to load student data</p>
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <FaUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
            <p className="text-gray-600">No students are currently enrolled in this group</p>
          </div>
        ) : (
          <div className="p-6">
            <DataTable
              records={students}
              columns={[
                {
                  accessor: "studentId",
                  title: "Student ID",
                  width: 120,
                },
                {
                  accessor: "studentName",
                  title: "Student Name",
                  render: (row: EventGroupStudentDto) => (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 text-xs">
                          {row.studentName
                            ? row.studentName.split(" ").map((n) => n[0]).join("")
                            : "??"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{row.studentName}</p>
                        <p className="text-xs text-gray-500">{row.studentId}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  accessor: "status",
                  title: "Status",
                  render: (row: EventGroupStudentDto) => (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Enrolled
                    </span>
                  ),
                },
                {
                  accessor: "actions",
                  title: "Actions",
                  render: (row: EventGroupStudentDto) => (
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View Details
                      </button>
                    </div>
                  ),
                },
              ]}
              minHeight={200}
              noRecordsText="No students found"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventGroupDetailPage; 