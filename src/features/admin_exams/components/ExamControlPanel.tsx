import { useState, useEffect } from 'react';
import { PiPlay, PiStop, PiPause, PiUsers, PiClock, PiCalendar, PiWarning } from 'react-icons/pi';
import { FaEye, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useEventControllerStartExam } from '../../../generated/hooks/eventsHooks/useEventControllerStartExam';
import { useEventControllerEndExam } from '../../../generated/hooks/eventsHooks/useEventControllerEndExam';
import { useEventControllerCalculateGroups } from '../../../generated/hooks/eventsHooks/useEventControllerCalculateGroups';
import { useEventControllerCreateGroups } from '../../../generated/hooks/eventsHooks/useEventControllerCreateGroups';
import { EventDto } from '../../../generated/types/EventDto';
import { GroupCalculationResultDto } from '../../../generated/types/GroupCalculationResultDto';
import { CreateScheduleDto } from '../../../generated/types/CreateScheduleDto';
import { useExamStore } from '../../../store/examStore';
import Modal from '../../../ui/modal/Modal';
import { DataTable } from 'mantine-datatable';

interface ExamControlPanelProps {
  event: EventDto;
  schedules?: any[];
  onRefresh?: () => void;
}

const ExamControlPanel = ({ event, schedules = [], onRefresh }: ExamControlPanelProps) => {
  const examStore = useExamStore();
  const [showGroupCalculation, setShowGroupCalculation] = useState(false);
  const [calculationResult, setCalculationResult] = useState<GroupCalculationResultDto | null>(null);
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);

  // API Hooks
  const startExamMutation = useEventControllerStartExam();
  const endExamMutation = useEventControllerEndExam();
  const { data: groupCalculation, isLoading: calculating, refetch: recalculateGroups } = useEventControllerCalculateGroups(
    event.id,
    {
      query: {
        enabled: false, // Only fetch when manually triggered
      }
    }
  );
  const createGroupsMutation = useEventControllerCreateGroups();

  // Update calculation result when data changes
  useEffect(() => {
    if (groupCalculation?.data) {
      setCalculationResult(groupCalculation.data);
    }
  }, [groupCalculation]);

  const handleStartExam = async (scheduleId: string) => {
    try {
      await startExamMutation.mutateAsync({ scheduleId });
      toast.success('Exam started successfully');
      examStore.updateEventScheduleStatus(scheduleId, 'started');
      onRefresh?.();
    } catch (error) {
      console.error('Failed to start exam:', error);
      toast.error('Failed to start exam');
    }
  };

  const handleEndExam = async (scheduleId: string) => {
    try {
      await endExamMutation.mutateAsync({ scheduleId });
      toast.success('Exam ended successfully');
      examStore.updateEventScheduleStatus(scheduleId, 'ended');
      onRefresh?.();
    } catch (error) {
      console.error('Failed to end exam:', error);
      toast.error('Failed to end exam');
    }
  };

  const handleCalculateGroups = async () => {
    try {
      setShowGroupCalculation(true);
      await recalculateGroups();
    } catch (error) {
      console.error('Failed to calculate groups:', error);
      toast.error('Failed to calculate optimal groups');
    }
  };

  const handleCreateGroups = async () => {
    if (!calculationResult) return;

    try {
      // Create basic schedule structure based on the calculation result
      // Note: The API returns arrays of strings instead of objects
      const scheduleData: CreateScheduleDto[] = [];
      
      // We'll create one schedule per group distribution item
      calculationResult.groupDistribution.forEach((groupId, index) => {
        const labId = calculationResult.labAvailability[index % calculationResult.labAvailability.length];
        
        scheduleData.push({
          courseGroupId: groupId,
          labId: labId,
          dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          assistantId: 'assistant-1', // Would be selected from UI
          maxStudents: 30, // Default value - would be calculated properly
        });
      });

      await createGroupsMutation.mutateAsync({
        id: event.id,
        data: { schedules: scheduleData }
      });

      toast.success('Exam groups and schedules created successfully');
      setShowGroupCalculation(false);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to create groups:', error);
      toast.error('Failed to create exam groups');
    }
  };

  const getScheduleStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'exam_mode_active': return 'bg-yellow-100 text-yellow-800';
      case 'started': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canStartExam = (schedule: any) => {
    return schedule.status === 'scheduled' || schedule.status === 'exam_mode_active';
  };

  const canEndExam = (schedule: any) => {
    return schedule.status === 'started';
  };

  return (
    <div className="space-y-6">
      {/* Event Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{event.name}</h2>
          <div className="flex items-center gap-2">
            {event.isExam && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Exam
              </span>
            )}
            {event.isInLab && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                In Lab
              </span>
            )}
            {event.autoStart && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Auto Start
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg">
              <PiClock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold">{event.duration} minutes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-light rounded-lg">
              <PiUsers className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Degree</p>
              <p className="font-semibold">{event.degree} points</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <PiWarning className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Exam Mode Start</p>
              <p className="font-semibold">{event.examModeStartMinutes} min before</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <PiCalendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Schedules</p>
              <p className="font-semibold">{schedules.length} sessions</p>
            </div>
          </div>
        </div>

        {event.description && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{event.description}</p>
          </div>
        )}
      </div>

      {/* Group Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Group Management</h3>
          <button
            onClick={handleCalculateGroups}
            disabled={calculating}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {calculating ? 'Calculating...' : 'Calculate Optimal Groups'}
          </button>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <PiUsers className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No exam schedules created yet</p>
            <p className="text-sm">Calculate optimal groups to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {schedules.length} exam session(s) configured for this event
            </p>
          </div>
        )}
      </div>

      {/* Schedule Control */}
      {schedules.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Sessions</h3>
          
          <DataTable
            highlightOnHover
            withBorder
            className="table-hover"
            records={schedules}
            columns={[
              {
                accessor: 'labName',
                title: 'Lab',
                render: (row) => (
                  <span className="font-medium">{row.labName || 'Unknown Lab'}</span>
                ),
              },
              {
                accessor: 'dateTime',
                title: 'Date & Time',
                render: (row) => (
                  <div>
                    <p className="font-medium">{new Date(row.dateTime).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{new Date(row.dateTime).toLocaleTimeString()}</p>
                  </div>
                ),
              },
              {
                accessor: 'status',
                title: 'Status',
                render: (row) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScheduleStatusColor(row.status)}`}>
                    {row.status?.replace('_', ' ').toUpperCase() || 'SCHEDULED'}
                  </span>
                ),
              },
              {
                accessor: 'enrolledStudents',
                title: 'Students',
                render: (row) => (
                  <span>{row.enrolledStudents || 0} / {row.maxStudents || 'N/A'}</span>
                ),
              },
              {
                accessor: 'actions',
                title: 'Actions',
                render: (row) => (
                  <div className="flex items-center gap-2">
                    {canStartExam(row) && (
                      <button
                        onClick={() => handleStartExam(row.id)}
                        disabled={startExamMutation.isPending}
                        className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 disabled:opacity-50"
                        title="Start Exam"
                      >
                        <PiPlay className="w-4 h-4" />
                      </button>
                    )}
                    {canEndExam(row) && (
                      <button
                        onClick={() => handleEndExam(row.id)}
                        disabled={endExamMutation.isPending}
                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
                        title="End Exam"
                      >
                        <PiStop className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      title="View Details"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* Group Calculation Modal */}
      <Modal
        isOpen={showGroupCalculation}
        onClose={() => setShowGroupCalculation(false)}
        title="Optimal Group Calculation"
        size="xl"
      >
        {calculating ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Calculating optimal groups...</span>
          </div>
        ) : calculationResult ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Calculation Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="font-semibold">{calculationResult.totalStudents}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Required Sessions</p>
                  <p className="font-semibold">{calculationResult.requiredSessions}</p>
                </div>
              </div>
            </div>

            {/* Group Distribution - Note: API returns string arrays */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Group Distribution</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Groups identified:</p>
                <div className="flex flex-wrap gap-2">
                  {calculationResult.groupDistribution.map((groupId, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {groupId}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Lab Availability - Note: API returns string arrays */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Available Labs</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Labs available:</p>
                <div className="flex flex-wrap gap-2">
                  {calculationResult.labAvailability.map((labId, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      {labId}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowGroupCalculation(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroups}
                disabled={createGroupsMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createGroupsMutation.isPending ? 'Creating...' : 'Create Groups & Schedules'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No calculation results available</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExamControlPanel; 