import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { FaArrowLeft, FaUsers, FaClock, FaDownload } from "react-icons/fa";
import { LuGraduationCap, LuRefreshCw } from "react-icons/lu";
import { DataTable } from "mantine-datatable";
import { EventDto } from "../../../generated/types/EventDto";
import GroupCreationModal from "../components/GroupCreationModal";
import toast from "react-hot-toast";
import { useEventControllerGetById } from "../../../generated/hooks/eventsHooks/useEventControllerGetById";
import { useEventGroupControllerGetEventGroups } from "../../../generated/hooks/event-groupsHooks/useEventGroupControllerGetEventGroups";
import { eventControllerDownloadSubmissions } from "../../../generated/hooks/eventsHooks/useEventControllerDownloadSubmissions";
import { EventGroupDto } from "../../../generated/types/EventGroupDto";

const EventDashboardPage = () => {
  const { courseId, eventId } = useParams();
  const navigate = useNavigate();
  const [isRecalculateModalOpen, setIsRecalculateModalOpen] = useState(false);
  const [isDownloadingSubmissions, setIsDownloadingSubmissions] = useState(false);

  // API hooks
  const { data: eventData, isLoading: eventLoading, error: eventError, refetch: refetchEvent } = useEventControllerGetById(
    eventId || '',
    {
      query: {
        enabled: !!eventId
      }
    }
  );

  const { data: eventGroupsData, isLoading: groupsLoading, error: groupsError, refetch: refetchGroups } = useEventGroupControllerGetEventGroups(
    eventId || '',
    {
      query: {
        enabled: !!eventId
      }
    }
  );

  const event = eventData?.data as EventDto;
  const eventGroups = (eventGroupsData?.data as EventGroupDto[]) || [];

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

  const handleGroupClick = (group: EventGroupDto) => {
    navigate(`/courses/${courseId}/events/${eventId}/groups/${group.id}`);
  };

  const handleRecalculateGroups = () => {
    setIsRecalculateModalOpen(true);
  };

  const handleRecalculateComplete = () => {
    // Refresh the data after recalculation
    refetchEvent();
    refetchGroups();
    setIsRecalculateModalOpen(false);
    toast.success('Groups recalculated successfully');
  };

  const handleDownloadSubmissions = async () => {
    console.log(`[EventDashboard] Starting download submissions for event: ${event.name} (ID: ${event.id})`);
    console.log(`[EventDashboard] Event groups:`, eventGroups);
    
    if (!eventGroups.length) {
      console.warn(`[EventDashboard] No groups found for event ${event.id}`);
      toast.error('No groups found for this event');
      return;
    }

    console.log(`[EventDashboard] Found ${eventGroups.length} groups to download from`);
    setIsDownloadingSubmissions(true);
    
    try {
      // Download submissions for each group/schedule
      for (const group of eventGroups) {
        console.log(`[EventDashboard] Processing group: ${group.labName} (ID: ${group.id})`);
        
        try {
          console.log(`[EventDashboard] Making API call to eventControllerDownloadSubmissions for group ${group.id}`);
          const response = await eventControllerDownloadSubmissions(group.id);
          
          console.log(`[EventDashboard] API response received for group ${group.labName}:`, {
            status: response.status,
            dataSize: response.data ? (response.data as ArrayBuffer).byteLength : 'No data',
            headers: response.headers
          });
          
          // Create download link
          const blob = new Blob([response.data as ArrayBuffer], { type: 'application/zip' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${event.name}_${group.labName}_submissions.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          console.log(`[EventDashboard] Successfully created and triggered download for ${group.labName}. Blob size: ${blob.size} bytes`);
          
        } catch (error) {
          console.error(`[EventDashboard] Failed to download submissions for ${group.labName}:`, error);
          toast.error(`Failed to download submissions for ${group.labName}`);
        }
      }
      
      console.log(`[EventDashboard] All downloads completed successfully`);
      toast.success('All submissions downloaded successfully');
    } catch (error) {
      console.error(`[EventDashboard] Download submissions error:`, error);
      toast.error('Failed to download submissions');
    } finally {
      setIsDownloadingSubmissions(false);
      console.log(`[EventDashboard] Download process finished, isDownloadingSubmissions set to false`);
    }
  };

  if (eventLoading || groupsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Loading event data...</span>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error Loading Event</h3>
          <p className="text-red-600 text-sm mt-1">
            {eventError ? 'Failed to load event data' : 'Event not found'}
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
              <span>{event.isInLab ? "In Lab" : event.isOnline ? "Online" : "Custom Location"}</span>
              <span>•</span>
              <span>{event.duration} minutes</span>
              {event.hasMarks && event.totalMarks && (
                <>
                  <span>•</span>
                  <span>{event.totalMarks} marks</span>
                </>
              )}
            </div>
            {event.description && (
              <p className="text-gray-600 text-sm mt-2">{event.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => navigate(`/courses/${courseId}/events/${eventId}/groups`)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
            >
              <FaUsers size={16} />
              Manage Groups
            </button>
            {event.isExam && event.requiresModels && (
              <button 
                onClick={() => navigate(`/courses/${courseId}/events/${eventId}/models`)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-colors"
              >
                <LuGraduationCap size={16} />
                Exam Models
              </button>
            )}
            {event.isExam && (
              <button 
                onClick={handleDownloadSubmissions}
                disabled={isDownloadingSubmissions || eventGroups.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDownload size={16} />
                {isDownloadingSubmissions ? 'Downloading...' : 'Download Submissions'}
              </button>
            )}
            <button 
              onClick={handleRecalculateGroups}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              <LuRefreshCw size={16} />
              Recalculate Groups
            </button>
          </div>
        </div>
      </div>

      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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

        {/* Total Students */}
        <div className="bg-white p-4 rounded-md border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaUsers size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-2xl font-semibold">
                {eventGroups.reduce((total, group) => total + group.enrolledStudents, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Groups Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium">Event Groups</h2>
        </div>
        
        {groupsError ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-red-800 font-medium">Error Loading Groups</h3>
              <p className="text-red-600 text-sm mt-1">Failed to load event groups</p>
            </div>
          </div>
        ) : eventGroups.length === 0 ? (
          <div className="p-12 text-center">
            <FaUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Created</h3>
            <p className="text-gray-600 mb-4">Groups will appear here once they are created for this event</p>
          </div>
        ) : (
          <div className="p-6">
            <DataTable
              records={eventGroups}
              columns={[
                {
                  accessor: "labName",
                  title: "Lab",
                  render: (group: EventGroupDto) => (
                    <div>
                      <div className="font-medium">{group.labName}</div>
                    </div>
                  ),
                },
                {
                  accessor: "dateTime",
                  title: "Date & Time",
                  render: (group: EventGroupDto) => (
                    <div className="text-sm">
                      {formatDateTime(group.dateTime)}
                    </div>
                  ),
                },
                {
                  accessor: "enrolledStudents",
                  title: "Students",
                  render: (group: EventGroupDto) => (
                    <div className="text-center">
                      <span className="font-medium">{group.enrolledStudents}</span>
                      <span className="text-gray-500">/{group.maxStudents}</span>
                    </div>
                  ),
                },
                {
                  accessor: "autoStart",
                  title: "Auto Start",
                  render: (group: EventGroupDto) => (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      group.autoStart 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {group.autoStart ? 'Enabled' : 'Disabled'}
                    </span>
                  ),
                },
                {
                  accessor: "status",
                  title: "Status",
                  render: (group: EventGroupDto) => (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      group.status === 'started' 
                        ? 'bg-green-100 text-green-800'
                        : group.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {group.status}
                    </span>
                  ),
                },
                {
                  accessor: "actions",
                  title: "Actions",
                  render: (group: EventGroupDto) => (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGroupClick(group)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  ),
                },
              ]}
              minHeight={200}
              noRecordsText="No groups found"
            />
          </div>
        )}
      </div>

      {/* Recalculate Groups Modal */}
      <GroupCreationModal
        isOpen={isRecalculateModalOpen}
        onClose={() => setIsRecalculateModalOpen(false)}
        courseId={courseId || ''}
        courseName={event?.name || 'Course'}
        onEventCreated={handleRecalculateComplete}
        existingGroups={eventGroups}
        eventId={eventId}
      />
    </div>
  );
};

export default EventDashboardPage; 