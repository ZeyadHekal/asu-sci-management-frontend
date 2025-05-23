import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuFilter, LuCalendar, LuClock, LuUsers, LuGraduationCap } from "react-icons/lu";
import { FaPlus } from "react-icons/fa";
import Select from "react-select";
import { EventDto } from "../../../generated/types/EventDto";
import { useEventControllerGetPaginated } from "../../../generated/hooks/eventsHooks/useEventControllerGetPaginated";
import EventDetailsModal from "./EventDetailsModal";

interface CourseEventsTabProps {
  courseId: number;
}

// Mock events data - would be fetched from API
const mockEventsData: (EventDto & { eventGroups?: number })[] = [
  {
    id: "1",
    name: "Midterm Exam",
    duration: 120,
    isExam: true,
    isInLab: true,
    examFiles: "midterm-files.zip",
    degree: 30,
    courseId: "1",
    eventGroups: 3
  },
  {
    id: "2", 
    name: "Assignment 1",
    duration: 60,
    isExam: false,
    isInLab: false,
    examFiles: "",
    degree: 0, // No marks assigned
    courseId: "1",
    eventGroups: 1
  },
  {
    id: "3",
    name: "Lab Quiz",
    duration: 30,
    isExam: true,
    isInLab: true,
    examFiles: "quiz-files.zip",
    degree: 10,
    courseId: "1",
    eventGroups: 2
  },
  {
    id: "4",
    name: "Project Presentation",
    duration: 90,
    isExam: false,
    isInLab: false,
    examFiles: "",
    degree: 0, // No marks assigned
    courseId: "1",
    eventGroups: 1
  }
];

const CourseEventsTab = ({ courseId }: CourseEventsTabProps) => {
  const navigate = useNavigate();
  
  // States for pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZES = [10, 20, 30, 50];

  // State for search
  const [search, setSearch] = useState("");

  // States for filters
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasMarksFilter, setHasMarksFilter] = useState<{value: string, label: string} | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<{value: string, label: string} | null>(null);

  // States for filtered and paginated data
  const [allEvents, setAllEvents] = useState(mockEventsData);
  const [filteredEvents, setFilteredEvents] = useState<typeof mockEventsData>([]);
  const [paginatedEvents, setPaginatedEvents] = useState<typeof mockEventsData>([]);

  // States for modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);

  // Filter options
  const hasMarksOptions = [
    { value: "all", label: "All Events" },
    { value: "with-marks", label: "With Marks" },
    { value: "without-marks", label: "Without Marks" }
  ];

  const eventTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "exam", label: "Exams" },
    { value: "assignment", label: "Assignments" }
  ];

  // Apply search and filters
  useEffect(() => {
    let results = [...allEvents];
    
    // Apply search
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      results = results.filter(event =>
        event.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply has marks filter
    if (hasMarksFilter && hasMarksFilter.value !== "all") {
      if (hasMarksFilter.value === "with-marks") {
        results = results.filter(event => event.degree > 0);
      } else if (hasMarksFilter.value === "without-marks") {
        results = results.filter(event => event.degree === 0);
      }
    }
    
    // Apply event type filter
    if (eventTypeFilter && eventTypeFilter.value !== "all") {
      if (eventTypeFilter.value === "exam") {
        results = results.filter(event => event.isExam);
      } else if (eventTypeFilter.value === "assignment") {
        results = results.filter(event => !event.isExam);
      }
    }
    
    setFilteredEvents(results);
    setPage(1); // Reset to first page when filters change
  }, [search, allEvents, hasMarksFilter, eventTypeFilter]);

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
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  // Reset filters
  const handleResetFilters = () => {
    setHasMarksFilter(null);
    setEventTypeFilter(null);
    setSearch("");
  };

  return (
    <div className="flex flex-col gap-6">
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
            onClick={handleCreateEvent}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md text-sm"
          >
            <FaPlus size={14} />
            Create Event
          </button>
          <button className="px-4 py-2 border border-secondary text-secondary rounded-md text-sm">
            Export List
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-gray-50 p-4 rounded-md border">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="w-full md:w-[250px]">
              <label className="text-sm font-medium mb-1 block">Has Marks</label>
              <Select
                options={hasMarksOptions}
                value={hasMarksFilter}
                onChange={setHasMarksFilter}
                placeholder="Filter by marks..."
                isClearable
                classNamePrefix="react-select"
              />
            </div>
            
            <div className="w-full md:w-[250px]">
              <label className="text-sm font-medium mb-1 block">Event Type</label>
              <Select
                options={eventTypeOptions}
                value={eventTypeFilter}
                onChange={setEventTypeFilter}
                placeholder="Filter by type..."
                isClearable
                classNamePrefix="react-select"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-secondary"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="panel">
        <DataTable
          highlightOnHover
          withBorder
          className="table-hover cursor-pointer"
          records={paginatedEvents}
          totalRecords={filteredEvents.length}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={(p) => setPage(p)}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={setPageSize}
          onRowClick={(row) => handleEventClick(row)}
          columns={[
            {
              accessor: "name",
              title: "Event Name",
              render: (row) => (
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${row.isExam ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {row.isExam ? <LuGraduationCap size={16} /> : <LuUsers size={16} />}
                  </div>
                  <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-gray-500">
                      {row.isExam ? "Exam" : "Assignment"} • {row.isInLab ? "In Lab" : "Online"}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              accessor: "duration",
              title: "Duration",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <LuClock size={14} className="text-gray-400" />
                  <span>{row.duration} min</span>
                </div>
              ),
            },
            {
              accessor: "degree",
              title: "Marks",
              render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  row.degree > 0 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {row.degree > 0 ? `${row.degree} marks` : "No marks"}
                </span>
              ),
            },
            {
              accessor: "eventGroups",
              title: "Groups",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <LuUsers size={14} className="text-gray-400" />
                  <span>{row.eventGroups || 0}</span>
                </div>
              ),
            },
            {
              accessor: "actions",
              title: "Actions",
              render: (row) => (
                <button
                  onClick={(e) => handleEditEvent(row, e)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Edit
                </button>
              ),
            },
          ]}
        />
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <LuCalendar size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No events found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filters, or create a new event.
          </p>
        </div>
      )}

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
        courseId={courseId}
      />
    </div>
  );
};

export default CourseEventsTab; 