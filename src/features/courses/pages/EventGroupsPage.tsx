import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { LuUsers, LuArrowLeft, LuPlay, LuSettings, LuUserPlus, LuUserMinus, LuArrowRight } from 'react-icons/lu';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useEventGroupControllerGetEventGroups } from '../../../generated/hooks/event-groupsHooks/useEventGroupControllerGetEventGroups';
import { useEventGroupControllerGetEventGroupStudents } from '../../../generated/hooks/event-groupsHooks/useEventGroupControllerGetEventGroupStudents';
import { useEventGroupControllerUpdateAutoStart } from '../../../generated/hooks/event-groupsHooks/useEventGroupControllerUpdateAutoStart';
import { useEventGroupControllerStartExamForGroup } from '../../../generated/hooks/event-groupsHooks/useEventGroupControllerStartExamForGroup';
import { useEventGroupControllerMoveStudentBetweenGroups } from '../../../generated/hooks/event-groupsHooks/useEventGroupControllerMoveStudentBetweenGroups';
import { MoveStudentBetweenGroupsDto } from '../../../generated/types/MoveStudentBetweenGroupsDto';
import { EventGroupDto } from '../../../generated/types/EventGroupDto';
import { EventGroupStudentDto } from '../../../generated/types/EventGroupStudentDto';

const EventGroupsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<EventGroupDto | null>(null);
  const [showMoveStudentModal, setShowMoveStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<EventGroupStudentDto | null>(null);

  // API hooks
  const { data: eventGroupsData, isLoading: groupsLoading, error: groupsError } = useEventGroupControllerGetEventGroups(
    eventId || '',
    {
      query: {
        enabled: !!eventId
      }
    }
  );

  const { data: studentsData, isLoading: studentsLoading } = useEventGroupControllerGetEventGroupStudents(
    selectedGroup?.id || '',
    {
      query: {
        enabled: !!selectedGroup?.id
      }
    }
  );

  const { mutateAsync: updateAutoStart } = useEventGroupControllerUpdateAutoStart();
  const { mutateAsync: startExam } = useEventGroupControllerStartExamForGroup();
  const { mutateAsync: moveStudent } = useEventGroupControllerMoveStudentBetweenGroups();

  const eventGroups = (eventGroupsData?.data as EventGroupDto[]) || [];
  const students = (studentsData?.data as EventGroupStudentDto[]) || [];
  const loading = groupsLoading;

  const handleGroupSelect = (group: EventGroupDto) => {
    setSelectedGroup(group);
  };

  const handleStartExam = async (groupId: string) => {
    try {
      await startExam({ groupId });
      toast.success('Exam started successfully');
      // The data will be refetched automatically by react-query
    } catch (error) {
      toast.error('Failed to start exam');
    }
  };

  const handleToggleAutoStart = async (groupId: string) => {
    try {
      await updateAutoStart({ groupId });
      toast.success('Auto-start setting updated');
      // The data will be refetched automatically by react-query
    } catch (error) {
      toast.error('Failed to update auto-start setting');
    }
  };

  const handleMoveStudent = (student: EventGroupStudentDto) => {
    setSelectedStudent(student);
    setShowMoveStudentModal(true);
  };

  const handleConfirmMoveStudent = async (targetGroupId: string) => {
    if (!selectedStudent || !selectedGroup || !eventId) return;

    try {
      await moveStudent({ 
        data: {
          studentId: selectedStudent.studentId,
          fromCourseGroupId: selectedGroup.id,
          toCourseGroupId: targetGroupId,
          courseId: eventId
        }
      });
      toast.success('Student moved successfully');
      setShowMoveStudentModal(false);
      setSelectedStudent(null);
      // The data will be refetched automatically by react-query
    } catch (error) {
      toast.error('Failed to move student');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Loading event groups...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
          >
            <LuArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Groups</h1>
            <p className="text-gray-600">
              {eventGroups.length > 0 ? eventGroups[0].eventName : 'Event Management'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Event Groups</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {eventGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedGroup?.id === group.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleGroupSelect(group)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{group.labName}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        group.status === 'started' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {group.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{group.enrolledStudents}/{group.maxStudents} students</p>
                      <p>{new Date(group.dateTime).toLocaleString()}</p>
                      {group.autoStart && (
                        <p className="text-green-600 font-medium">Auto-start enabled</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Group Details */}
        <div className="lg:col-span-2">
          {selectedGroup ? (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium">{selectedGroup.labName}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedGroup.enrolledStudents} students enrolled
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleAutoStart(selectedGroup.id)}
                    className={`btn ${selectedGroup.autoStart ? 'btn-outline-primary' : 'btn-outline-gray'} text-sm`}
                  >
                    <LuSettings className="w-4 h-4 mr-2" />
                    {selectedGroup.autoStart ? 'Disable Auto-start' : 'Enable Auto-start'}
                  </button>
                  {selectedGroup.status === 'scheduled' && (
                    <button
                      onClick={() => handleStartExam(selectedGroup.id)}
                      className="btn btn-primary text-sm"
                    >
                      <LuPlay className="w-4 h-4 mr-2" />
                      Start Exam
                    </button>
                  )}
                </div>
              </div>
              
              {/* Students List */}
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Students</h3>
                  <div className="flex items-center space-x-2">
                    <button className="btn btn-outline-primary text-sm">
                      <LuUserPlus className="w-4 h-4 mr-2" />
                      Add Student
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seat No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mark
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.studentId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.studentName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.username}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.seatNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              student.isInExamMode
                                ? 'bg-green-100 text-green-800'
                                : student.hasAttended
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {student.isInExamMode ? 'In Exam' : student.hasAttended ? 'Attended' : 'Not Started'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.mark !== undefined ? `${student.mark}/100` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => handleMoveStudent(student)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <LuArrowRight className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <LuUserMinus className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <LuUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Group</h3>
              <p className="text-gray-600">Choose a group from the list to view and manage students</p>
            </div>
          )}
        </div>
      </div>

      {/* Move Student Modal */}
      <Transition appear show={showMoveStudentModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowMoveStudentModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Move Student
                  </Dialog.Title>
                  
                  {selectedStudent && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        Moving <strong>{selectedStudent.studentName}</strong> to:
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {eventGroups
                      .filter(group => group.id !== selectedGroup?.id)
                      .map((group) => (
                        <button
                          key={group.id}
                          onClick={() => handleConfirmMoveStudent(group.id)}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                          <div className="font-medium">{group.labName}</div>
                          <div className="text-sm text-gray-600">
                            {group.enrolledStudents}/{group.maxStudents} students
                          </div>
                        </button>
                      ))}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="btn btn-outline-gray"
                      onClick={() => setShowMoveStudentModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default EventGroupsPage; 