import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { FaArrowLeft, FaUsers, FaClock, FaCalendarAlt } from "react-icons/fa";
import { LuGraduationCap, LuPlus } from "react-icons/lu";
import { DataTable } from "mantine-datatable";
import { EventDto } from "../../../generated/types/EventDto";
import { EventScheduleDto } from "../../../generated/types/EventScheduleDto";
import EventGroupModal from "../components/EventGroupModal";

// Mock event data
const mockEventData: EventDto = {
  id: "1",
  name: "Midterm Exam",
  duration: 120,
  isExam: true,
  isInLab: true,
  examFiles: "midterm-files.zip",
  degree: 30,
  courseId: "1"
};

// Mock event groups data (event schedules)
const mockEventGroups: (EventScheduleDto & { 
  groupName: string; 
  enrolledStudents: number; 
  capacity: number;
  labName: string;
})[] = [
  {
    id: "1",
    labId: "lab1",
    labName: "Lab A1-110",
    dateTime: new Date("2024-04-15T10:00:00"),
    examFiles: "midterm-files.zip",
    assisstantId: "ta1",
    groupName: "Group A",
    enrolledStudents: 18,
    capacity: 20
  },
  {
    id: "2", 
    labId: "lab2",
    labName: "Lab A1-111",
    dateTime: new Date("2024-04-15T13:00:00"),
    examFiles: "midterm-files.zip",
    assisstantId: "ta2",
    groupName: "Group B",
    enrolledStudents: 22,
    capacity: 25
  },
  {
    id: "3",
    labId: "lab1", 
    labName: "Lab A1-110",
    dateTime: new Date("2024-04-16T10:00:00"),
    examFiles: "midterm-files.zip",
    assisstantId: "ta3",
    groupName: "Group C",
    enrolledStudents: 15,
    capacity: 20
  }
];

const EventDashboardPage = () => {
  const { courseId, eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [eventGroups, setEventGroups] = useState(mockEventGroups);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<typeof mockEventGroups[0] | null>(null);

  useEffect(() => {
    // In a real app, you would fetch event data from an API
    setEvent(mockEventData);
  }, [eventId]);

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

  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (group: typeof mockEventGroups[0]) => {
    setSelectedGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleGroupClick = (group: typeof mockEventGroups[0]) => {
    navigate(`/courses/${courseId}/events/${eventId}/groups/${group.id}`);
  };

  if (!event) {
    return <div className="p-6">Loading event data...</div>;
  }

  return (
    <div className="panel mt-6">
      {/* Back Button & Header */}
      <div className="flex flex-col gap-4 mb-6">
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="flex items-center gap-1 text-secondary hover:text-secondary-dark self-start"
        >
          <FaArrowLeft size={14} />
          <span>Back to Course Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary">{event.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <span className="font-semibold">
                {event.isExam ? "Exam" : "Assignment"}
              </span>
              <span>•</span>
              <span>{event.isInLab ? "In Lab" : "Online"}</span>
              <span>•</span>
              <span>{event.duration} minutes</span>
              {event.degree > 0 && (
                <>
                  <span>•</span>
                  <span>{event.degree} marks</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleCreateGroup}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md text-sm"
            >
              <LuPlus size={16} />
              Create Group
            </button>
          </div>
        </div>
      </div>

      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Event Type */}
        <div className="bg-white p-4 rounded-md border shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${event.isExam ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              {event.isExam ? <LuGraduationCap size={24} /> : <FaUsers size={24} />}
            </div>
            <div>
              <p className="text-gray-600 text-sm">Type</p>
              <p className="text-lg font-semibold">
                {event.isExam ? "Exam" : "Assignment"}
              </p>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="bg-white p-4 rounded-md border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary-light text-primary">
              <FaClock size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Duration</p>
              <p className="text-2xl font-semibold">{event.duration} min</p>
            </div>
          </div>
        </div>

        {/* Total Groups */}
        <div className="bg-white p-4 rounded-md border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-secondary-light text-secondary">
              <FaUsers size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Groups</p>
              <p className="text-2xl font-semibold">{eventGroups.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Groups Table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Event Groups</h2>
        </div>

        <div className="panel">
          <DataTable
            highlightOnHover
            withBorder
            className="table-hover cursor-pointer"
            records={eventGroups}
            onRowClick={(row) => handleGroupClick(row)}
            columns={[
              {
                accessor: "groupName",
                title: "Group Name",
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-secondary-light text-secondary">
                      <FaUsers size={16} />
                    </div>
                    <span className="font-medium">{row.groupName}</span>
                  </div>
                ),
              },
              {
                accessor: "labName",
                title: "Lab",
                render: (row) => (
                  <span className="text-gray-700">{row.labName}</span>
                ),
              },
              {
                accessor: "dateTime",
                title: "Schedule",
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt size={14} className="text-gray-400" />
                    <span className="text-sm">{formatDateTime(row.dateTime)}</span>
                  </div>
                ),
              },
              {
                accessor: "enrolledStudents",
                title: "Students",
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{row.enrolledStudents}</span>
                    <span className="text-gray-500">/ {row.capacity}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2 ml-2">
                      <div 
                        className="bg-secondary h-2 rounded-full" 
                        style={{ width: `${(row.enrolledStudents / row.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ),
              },
              {
                accessor: "actions",
                title: "Actions",
                render: (row) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditGroup(row);
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Edit
                  </button>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Empty State */}
      {eventGroups.length === 0 && (
        <div className="text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <FaUsers size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No groups created yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create groups to organize students for this event.
          </p>
          <button
            onClick={handleCreateGroup}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md text-sm mx-auto"
          >
            <LuPlus size={16} />
            Create First Group
          </button>
        </div>
      )}

      {/* Event Group Modal */}
      <EventGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        group={selectedGroup}
        eventId={eventId!}
        courseId={courseId!}
      />
    </div>
  );
};

export default EventDashboardPage; 