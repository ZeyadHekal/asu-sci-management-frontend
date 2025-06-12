import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuFilter, LuCalendar, LuClock, LuUsers, LuGraduationCap } from "react-icons/lu";
import { FaPlus } from "react-icons/fa";
import Select from "react-select";
import { EventDto } from "../../../generated/types/EventDto";
import { useEventControllerGetCourseEvents } from "../../../generated/hooks/eventsHooks/useEventControllerGetCourseEvents";
import { eventControllerExportCourseEvents } from "../../../generated/hooks/eventsHooks/useEventControllerExportCourseEvents";
import GroupCreationModal from "./GroupCreationModal";
import toast from "react-hot-toast";

interface CourseEventsTabProps {
  courseId: string;
  courseName: string;
  hasEditAccess: boolean;
}

const CourseEventsTab = ({ courseId, courseName, hasEditAccess }: CourseEventsTabProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasMarksFilter, setHasMarksFilter] = useState<{value: string, label: string} | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<{value: string, label: string} | null>(null);
  
  // Modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);

  // Paginated events
  const [paginatedEvents, setPaginatedEvents] = useState<any[]>([]);

  // API hook for fetching events
  const { 
    data: eventsData, 
    isLoading, 
    error, 
    refetch 
  } = useEventControllerGetCourseEvents(courseId);

  // Transform events data to include additional computed fields
  const transformedEvents = useMemo(() => {
    if (!eventsData?.data) return [];
    
    return eventsData.data.map(event => ({
      ...event,
      // Use new fields instead of deprecated ones
      eventTypeDisplay: event.eventType || (event.isExam ? 'exam' : 'assignment'),
      locationDisplay: event.locationType 
        ? (event.locationType === 'lab_devices' ? 'Lab Devices' : 
           event.locationType === 'online' ? 'Online' : 
           event.locationType === 'lecture_hall' ? 'Lecture Hall' :
           event.locationType === 'hybrid' ? 'Hybrid' : String(event.locationType).replace('_', ' '))
        : (event.isInLab ? 'Lab Devices' : 'Online'),
      customLocationDisplay: event.customLocation || '',
      hasMarksDisplay: event.hasMarks || (event.degree && event.degree > 0),
      totalMarksDisplay: event.totalMarks || event.degree || 0,
      eventGroups: 0 // Will be added by backend later
    }));
  }, [eventsData]);

  // Filter options
  const hasMarksOptions = [
    { value: "all", label: "All Events" },
    { value: "yes", label: "With Marks" },
    { value: "no", label: "No Marks" }
  ];

  const eventTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "exam", label: "Exams" },
    { value: "quiz", label: "Quizzes" },
    { value: "assignment", label: "Assignments" },
    { value: "lab_assignment", label: "Lab Assignments" },
    { value: "project", label: "Projects" },
    { value: "presentation", label: "Presentations" },
    { value: "workshop", label: "Workshops" },
    { value: "practice", label: "Practice" }
  ];

  // Filtered events based on search and filters
  const filteredEvents = useMemo(() => {
    let filtered = transformedEvents;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply has marks filter
    if (hasMarksFilter && hasMarksFilter.value !== "all") {
      if (hasMarksFilter.value === "yes") {
        filtered = filtered.filter(event => event.hasMarksDisplay);
      } else if (hasMarksFilter.value === "no") {
        filtered = filtered.filter(event => !event.hasMarksDisplay);
      }
    }

    // Apply event type filter
    if (eventTypeFilter && eventTypeFilter.value !== "all") {
      filtered = filtered.filter(event => {
        const eventType = event.eventType || (event.isExam ? 'exam' : 'assignment');
        return eventType === eventTypeFilter.value;
      });
    }

    return filtered;
  }, [search, transformedEvents, hasMarksFilter, eventTypeFilter]);

  // Apply pagination
  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setPaginatedEvents(filteredEvents.slice(start, end));
  }, [page, pageSize, filteredEvents]);

  // Handle event click to navigate to event dashboard
  const handleEventClick = (event: EventDto & { eventGroups?: number }) => {
    navigate(`/courses/${courseId}/events/${event.id}`);
  };

  // Handle create new event
  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  // Handle edit event
  const handleEditEvent = (event: EventDto, e: React.MouseEvent) => {
    e.stopPropagation();
    // Editing not supported in GroupCreationModal, redirect to event dashboard
    navigate(`/courses/${courseId}/events/${event.id}`);
  };

  const handleModalSuccess = () => {
    refetch(); // Refresh events data
  };

  // Reset filters
  const handleResetFilters = () => {
    setHasMarksFilter(null);
    setEventTypeFilter(null);
    setSearch("");
  };

  // Export events
  const handleExportEvents = async () => {
    try {
      const response = await eventControllerExportCourseEvents(courseId);
      // Handle the response - could be a file download
      toast.success("Events exported successfully!");
    } catch (error) {
      console.error("Failed to export events:", error);
      toast.error("Failed to export events");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 text-lg font-semibold mb-2">Error loading events</div>
          <div className="text-gray-600 mb-4">{error.message}</div>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Event Button */}
      {hasEditAccess && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Course Events</h3>
          <button 
            onClick={handleCreateEvent}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md text-sm hover:bg-secondary-dark transition-colors"
          >
            <FaPlus size={14} />
            Create Event
          </button>
        </div>
      )}

      {/* Search and Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <LuSearch size={20} className="text-[#0E1726]" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="h-10 pl-10 pr-4 w-full md:w-[300px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
              isFilterOpen || hasMarksFilter || eventTypeFilter
                ? "bg-secondary text-white border-secondary"
                : "border-gray-300 text-gray-700"
            }`}
          >
            <LuFilter size={18} />
            <span>Filter</span>
            {(hasMarksFilter || eventTypeFilter) && (
              <span className="bg-white text-secondary rounded-full w-5 h-5 flex items-center justify-center text-xs ml-1">
                {(hasMarksFilter && hasMarksFilter.value !== "all" ? 1 : 0) + 
                 (eventTypeFilter && eventTypeFilter.value !== "all" ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleExportEvents}
            className="px-4 py-2 border border-secondary text-secondary rounded-md text-sm hover:bg-secondary hover:text-white transition-colors"
          >
            Export List
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Has Marks</label>
              <Select
                options={hasMarksOptions}
                value={hasMarksFilter}
                onChange={setHasMarksFilter}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Filter by marks..."
                isClearable
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <Select
                options={eventTypeOptions}
                value={eventTypeFilter}
                onChange={setEventTypeFilter}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Filter by type..."
                isClearable
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="panel">
        <DataTable
          highlightOnHover
          withBorder
          withColumnBorders
          className="table-hover cursor-pointer"
          records={paginatedEvents}
          onRowClick={(row) => handleEventClick(row)}
          totalRecords={filteredEvents.length}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={setPage}
          recordsPerPageOptions={[5, 10, 20, 50]}
          onRecordsPerPageChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          columns={[
            {
              accessor: "name",
              title: "Event Name",
              render: (row) => {
                const eventType = row.eventType || (row.isExam ? 'exam' : 'assignment');
                return (
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      eventType === 'exam' || eventType === 'quiz' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {eventType === 'exam' || eventType === 'quiz' ? (
                        <LuGraduationCap size={16} />
                      ) : (
                        <LuClock size={16} />
                      )}
                    </div>
                    <div>
                      <span className="font-medium">{row.name}</span>
                      <div className="text-xs text-gray-500 capitalize">
                        {eventType.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                );
              },
            },
            {
              accessor: "eventType",
              title: "Event Type",
              render: (row) => {
                const eventType = row.eventType || (row.isExam ? 'exam' : 'assignment');
                return (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    eventType === 'exam' || eventType === 'quiz' 
                      ? 'bg-red-100 text-red-800' 
                      : eventType === 'assignment' || eventType === 'lab_assignment'
                      ? 'bg-blue-100 text-blue-800'
                      : eventType === 'project'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {eventType.replace('_', ' ')}
                  </span>
                );
              },
            },
            {
              accessor: "location",
              title: "Location",
              render: (row) => {
                const location = row.customLocation || row.locationDisplay;
                return (
                  <div className="flex items-center gap-2">
                    <LuUsers size={14} className="text-gray-400" />
                    <span className="text-sm">{location}</span>
                  </div>
                );
              },
            },
            {
              accessor: "duration",
              title: "Duration",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <LuClock size={14} className="text-gray-400" />
                  <span className="text-sm">{row.duration} min</span>
                </div>
              ),
            },
            {
              accessor: "hasMarksDisplay",
              title: "Marks",
              render: (row) => {
                const hasMarks = row.hasMarks || (row.degree && row.degree > 0);
                const totalMarks = row.totalMarks || row.degree || 0;
                return (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    hasMarks
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {hasMarks ? `${totalMarks} pts` : 'No Marks'}
                  </span>
                );
              },
            },
            {
              accessor: "eventGroups",
              title: "Groups",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <LuUsers size={14} className="text-gray-400" />
                  <span className="text-sm">{row.eventGroups}</span>
                </div>
              ),
            },
            {
              accessor: "startDateTime",
              title: "Start Time",
              render: (row) => {
                if (!row.startDateTime) {
                  return (
                    <div className="flex items-center gap-2">
                      <LuCalendar size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-500">Not scheduled</span>
                    </div>
                  );
                }
                
                const date = new Date(row.startDateTime);
                const dateStr = date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                });
                const timeStr = date.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true
                });
                
                return (
                  <div className="flex items-center gap-2">
                    <LuCalendar size={14} className="text-gray-400" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{dateStr}</span>
                      <span className="text-xs text-gray-500">{timeStr}</span>
                    </div>
                  </div>
                );
              },
            },
            {
              accessor: "actions",
              title: "Actions",
              render: (row) => (
                hasEditAccess && (
                  <button
                    onClick={(e) => handleEditEvent(row, e)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Edit
                  </button>
                )
              ),
            },
          ]}
        />
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && !isLoading && (
        <div className="text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <LuCalendar size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {search || hasMarksFilter || eventTypeFilter ? "No events found" : "No events created yet"}
          </h3>
          <p className="text-gray-500 mb-4">
            {search || hasMarksFilter || eventTypeFilter 
              ? "Try adjusting your search or filters to find events." 
              : "Create your first event to get started."
            }
          </p>
          {hasEditAccess && !search && !hasMarksFilter && !eventTypeFilter && (
            <button
              onClick={handleCreateEvent}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md text-sm mx-auto"
            >
              <FaPlus size={14} />
              Create First Event
            </button>
          )}
        </div>
      )}

      {/* Group Creation Modal */}
      <GroupCreationModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        courseId={courseId}
        courseName={courseName}
        onEventCreated={handleModalSuccess}
      />
    </div>
  );
};

export default CourseEventsTab; 