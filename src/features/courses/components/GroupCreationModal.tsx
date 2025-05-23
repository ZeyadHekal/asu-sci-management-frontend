import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { LuX, LuCalendar, LuUsers, LuMapPin, LuTriangle, LuCheck, LuPlus, LuMinus, LuFileText, LuArrowLeft, LuArrowRight, LuRotateCcw, LuClock, LuGraduationCap, LuUpload, LuTrash2, LuSave } from 'react-icons/lu';
import Select, { MultiValue } from 'react-select';
import { useEventControllerSimulateGroupCreation } from '../../../generated/hooks/eventsHooks/useEventControllerSimulateGroupCreation';
import { useEventControllerCreateEventWithGroups } from '../../../generated/hooks/eventsHooks/useEventControllerCreateEventWithGroups';
import { eventControllerUploadExamModelFiles } from '../../../generated/hooks/eventsHooks/useEventControllerUploadExamModelFiles';
import { useUserControllerGetAllAssistants } from '../../../generated/hooks/usersHooks/useUserControllerGetAllAssistants';
import toast from 'react-hot-toast';
import { GroupCreationSimulationDto } from '../../../generated/types/GroupCreationSimulationDto';
import { CreateEventWithGroupsDto } from '../../../generated/types/CreateEventWithGroupsDto';
import { createEventWithGroupsDtoEventTypeEnum } from '../../../generated/types/CreateEventWithGroupsDto';
import { useExamModelControllerGetExamModelsForEvent } from '../../../generated/hooks/exam-modelsHooks/useExamModelControllerGetExamModelsForEvent';
import { useExamModelControllerUploadExamModels } from '../../../generated/hooks/exam-modelsHooks/useExamModelControllerUploadExamModels';
import { useStudentCourseControllerGetCourseStudents } from '../../../generated/hooks/student-coursesHooks/useStudentCourseControllerGetCourseStudents';
import { useLabControllerGetPaginated } from '../../../generated/hooks/labsHooks/useLabControllerGetPaginated';
import { useCourseGroupControllerCalculateLabCapacityForCourse } from '../../../generated/hooks/course-groupsHooks/useCourseGroupControllerCalculateLabCapacityForCourse';
import { useEventControllerGetById } from '../../../generated/hooks/eventsHooks/useEventControllerGetById';

interface GroupCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  onEventCreated?: () => void;
  existingGroups?: any[];
  eventId?: string;
}

interface EventForm {
  name: string;
  description: string;
  duration: number;
  eventType: string;
  locationType: string;
  customLocation: string;
  isExam: boolean;
  hasMarks: boolean;
  totalMarks?: number;
  examModeStartMinutes?: number;
}

interface ExamModel {
  id: string;
  name: string;
  files: File[];
  uploadedFileIds?: string[];
}

interface GroupModelAssignment {
  groupIndex: number;
  assignedModelIds: string[];
}

interface GroupScheduleForm {
  courseGroupId: string;
  labId: string;
  assistantIds: string[];
  maxStudents: number;
  date: string;
  time: string;
  autoStart: boolean;
}

interface LabSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableLabs: any[];
  onLabSelect: (labId: string, capacity?: number) => void;
  totalStudents: number;
  uncoveredStudents: number;
  courseId: string;
}

const LabSelectionModal = ({ isOpen, onClose, availableLabs, onLabSelect, totalStudents, uncoveredStudents, courseId }: LabSelectionModalProps) => {
  const [selectedLab, setSelectedLab] = useState<string>('');
  const [customCapacity, setCustomCapacity] = useState<number>(0);

  // Debug logging
  console.log('LabSelectionModal render:', { 
    isOpen, 
    availableLabs: availableLabs?.length, 
    labs: availableLabs,
    totalStudents, 
    uncoveredStudents, 
    courseId 
  });

  const { data: capacityData, isLoading: calculatingCapacity } = useCourseGroupControllerCalculateLabCapacityForCourse(
    selectedLab || '',
    courseId,
    {
      query: {
        enabled: !!(selectedLab && courseId)
      }
    }
  );

  const calculatedCapacity = (capacityData?.data as any)?.capacity || 0;

  const handleSelect = () => {
    if (!selectedLab) {
      toast.error('Please select a lab');
      return;
    }
    
    const capacity = customCapacity > 0 ? customCapacity : calculatedCapacity;
    
    if (capacity === 0) {
      toast.error('This lab has no available capacity for this course');
      return;
    }
    
    onLabSelect(selectedLab, capacity);
    onClose();
    setSelectedLab('');
    setCustomCapacity(0);
  };

  const previewUncovered = () => {
    const capacity = customCapacity > 0 ? customCapacity : calculatedCapacity;
    return Math.max(0, uncoveredStudents - capacity);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Select Lab for New Group
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <LuX className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Current Coverage Status</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Total Students:</span>
                      <span className="font-medium ml-2">{totalStudents}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Uncovered Students:</span>
                      <span className="font-medium ml-2">{uncoveredStudents}</span>
                    </div>
                  </div>
                  {selectedLab && (
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <span className="text-blue-700">After adding this group:</span>
                      <span className="font-medium ml-2 text-green-600">{previewUncovered()} uncovered</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Available Labs</h4>
                  
                  {availableLabs.map((lab) => (
                    <div 
                      key={lab.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedLab === lab.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedLab(lab.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium">{lab.name}</h5>
                          <div className="text-sm text-gray-600">
                            {selectedLab === lab.id ? (
                              calculatingCapacity ? (
                                <span>Calculating capacity...</span>
                              ) : (
                                <span>Effective Capacity: {calculatedCapacity} students</span>
                              )
                            ) : (
                              <span>Click to calculate capacity for this course</span>
                            )}
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={selectedLab === lab.id}
                          onChange={() => setSelectedLab(lab.id)}
                          className="text-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {selectedLab && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Capacity (optional)
                    </label>
                    <input
                      type="number"
                      value={customCapacity}
                      onChange={(e) => setCustomCapacity(parseInt(e.target.value) || 0)}
                      placeholder={`Default: ${calculatedCapacity}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      min="0"
                      max={calculatedCapacity}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSelect}
                    disabled={!selectedLab}
                    className={`btn btn-primary ${!selectedLab ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Add Group
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Assistant Selector Component
interface AssistantSelectorProps {
  selectedAssistantIds: string[];
  onChange: (assistantIds: string[]) => void;
}

const AssistantSelector = ({ selectedAssistantIds, onChange }: AssistantSelectorProps) => {
  const { data: assistantsData } = useUserControllerGetAllAssistants({
    query: { enabled: true }
  });

  const assistants = assistantsData?.data || [];
  
  const assistantOptions = assistants.map((assistant: any) => ({
    value: assistant.id,
    label: assistant.name
  }));

  const selectedOptions = assistantOptions.filter(option => 
    selectedAssistantIds.includes(option.value)
  );

  const handleChange = (selected: MultiValue<{ value: string; label: string }>) => {
    const selectedIds = selected ? selected.map(option => option.value) : [];
    onChange(selectedIds);
  };

  return (
    <Select
      options={assistantOptions}
      value={selectedOptions}
      onChange={handleChange}
      isMulti
      placeholder="Select assistants"
      className="react-select-container"
      classNamePrefix="react-select"
      styles={{
        control: (base) => ({ ...base, minHeight: '42px' }),
      }}
    />
  );
};

// Course Students Stats Component
interface CourseStudentsStatsProps {
  courseId: string;
  proposedGroups: any[];
}

const CourseStudentsStats = ({ courseId, proposedGroups }: CourseStudentsStatsProps) => {
  const { data: studentsData } = useStudentCourseControllerGetCourseStudents(courseId, {
    query: { enabled: !!courseId }
  });

  const totalStudents = studentsData?.data?.length || 0;
  const coveredStudents = proposedGroups.reduce((sum, group) => sum + (group.proposedCapacity || 0), 0);
  const uncoveredStudents = Math.max(0, totalStudents - coveredStudents);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg border">
        <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
        <div className="text-sm text-gray-600">Total Students</div>
      </div>
      <div className="bg-white p-4 rounded-lg border">
        <div className="text-2xl font-bold text-green-600">{coveredStudents}</div>
        <div className="text-sm text-gray-600">Covered Students</div>
      </div>
      <div className="bg-white p-4 rounded-lg border">
        <div className="text-2xl font-bold text-red-600">{uncoveredStudents}</div>
        <div className="text-sm text-gray-600">Uncovered Students</div>
      </div>
    </div>
  );
};

// Group Card Component
interface GroupCardProps {
  group: any;
  index: number;
  groupSchedules: any[];
  updateGroupSchedule: (index: number, field: string, value: any) => void;
  examModels: any[];
  groupModelAssignments: any[];
  toggleModelAssignment: (groupIndex: number, modelId: string) => void;
  isModelAssignedToGroup: (groupIndex: number, modelId: string) => boolean;
  autoStart: boolean;
  onAutoStartChange: (checked: boolean) => void;
  onRemoveGroup: () => void;
  isExam: boolean;
}

const GroupCard = ({ 
  group, 
  index, 
  groupSchedules, 
  updateGroupSchedule, 
  examModels, 
  groupModelAssignments, 
  toggleModelAssignment, 
  isModelAssignedToGroup, 
  autoStart, 
  onAutoStartChange, 
  onRemoveGroup, 
  isExam 
}: GroupCardProps) => {
  const schedule = groupSchedules[index] || {};
  
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-medium text-lg">Group {index + 1}</h5>
        <button
          type="button"
          onClick={onRemoveGroup}
          className="text-red-600 hover:text-red-800"
        >
          <LuTrash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lab</label>
          <div className="text-sm text-gray-600">{group.labName}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
          <div className="text-sm text-gray-600">{group.proposedCapacity} students</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={schedule.date || ''}
            onChange={(e) => updateGroupSchedule(index, 'date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input
            type="time"
            value={schedule.time || ''}
            onChange={(e) => updateGroupSchedule(index, 'time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Assistants</label>
        <AssistantSelector
          selectedAssistantIds={schedule.assistantIds || []}
          onChange={(assistantIds) => updateGroupSchedule(index, 'assistantIds', assistantIds)}
        />
      </div>

      {isExam && examModels.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Exam Models</label>
          <div className="space-y-2">
            {examModels.map((model) => (
              <label key={model.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={isModelAssignedToGroup(index, model.id)}
                  onChange={() => toggleModelAssignment(index, model.id)}
                  className="mr-2"
                />
                <span className="text-sm">{model.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={`autoStart-${index}`}
          checked={autoStart}
          onChange={(e) => onAutoStartChange(e.target.checked)}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor={`autoStart-${index}`} className="text-sm font-medium text-gray-700">
          Auto-start this group
        </label>
      </div>
    </div>
  );
};

// Validation Messages Component
interface ValidationMessagesProps {
  courseId: string;
  proposedGroups: any[];
  isExam: boolean;
  groupModelAssignments: any[];
}

const ValidationMessages = ({ courseId, proposedGroups, isExam, groupModelAssignments }: ValidationMessagesProps) => {
  const { data: studentsData } = useStudentCourseControllerGetCourseStudents(courseId, {
    query: { enabled: !!courseId }
  });

  const totalStudents = studentsData?.data?.length || 0;
  const coveredStudents = proposedGroups.reduce((sum, group) => sum + (group.proposedCapacity || 0), 0);
  const uncoveredStudents = Math.max(0, totalStudents - coveredStudents);

  const hasUncoveredStudents = uncoveredStudents > 0;
  const hasGroupsWithoutModels = isExam && proposedGroups.some((_, index) => {
    const assignment = groupModelAssignments.find(a => a.groupIndex === index);
    return !assignment || assignment.assignedModelIds.length === 0;
  });

  if (!hasUncoveredStudents && !hasGroupsWithoutModels) {
    return null;
  }

  return (
    <div className="space-y-3">
      {hasUncoveredStudents && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <LuTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Uncovered Students</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{uncoveredStudents} students are not covered by any group. Please add more groups or increase group capacities.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasGroupsWithoutModels && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
          <div className="flex">
            <LuTriangle className="h-5 w-5 text-orange-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">Missing Exam Models</h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>Some groups don't have exam models assigned. All groups in an exam must have at least one model assigned.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GroupCreationModal = ({ isOpen, onClose, courseId, courseName, onEventCreated, existingGroups, eventId }: GroupCreationModalProps) => {
  // NEW FLOW: event-details -> exam-models (if isExam) -> simulation (with inline model assignment)
  const [step, setStep] = useState<'event-details' | 'exam-models' | 'simulation'>('event-details');
  const [simulation, setSimulation] = useState<GroupCreationSimulationDto | null>(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [groupSchedules, setGroupSchedules] = useState<GroupScheduleForm[]>([]);
  const [examModels, setExamModels] = useState<ExamModel[]>([]);
  const [groupModelAssignments, setGroupModelAssignments] = useState<GroupModelAssignment[]>([]);
  const [showLabSelectionModal, setShowLabSelectionModal] = useState(false);
  const [eventForm, setEventForm] = useState<EventForm>({
    name: '',
    description: '',
    duration: 120,
    eventType: 'assignment',
    locationType: 'online',
    customLocation: '',
    isExam: false,
    hasMarks: false,
    totalMarks: undefined,
    examModeStartMinutes: undefined,
  });

  const [proposedGroups, setProposedGroups] = useState<any[]>([]);
  const [groupAutoStartSettings, setGroupAutoStartSettings] = useState<boolean[]>([]);
  const [autoStartAll, setAutoStartAll] = useState(true);
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Add new state for labs
  const { data: labsData } = useLabControllerGetPaginated({
    limit: 100,
    page: 0
  }, {
    query: { enabled: isOpen }
  });

  // React Query mutations
  const { mutateAsync: simulateGroupCreation } = useEventControllerSimulateGroupCreation();
  const { mutateAsync: createEventWithGroups } = useEventControllerCreateEventWithGroups();
  const { mutateAsync: uploadExamModels } = useExamModelControllerUploadExamModels();
  
  // Fetch assistants data
  const { data: assistantsData, isLoading: isLoadingAssistants } = useUserControllerGetAllAssistants({
    query: { enabled: isOpen }
  });

  // Fetch course students data
  const { data: studentsData } = useStudentCourseControllerGetCourseStudents(courseId, {
    query: { enabled: !!courseId && isOpen }
  });

  // Create assistant options for react-select
  const assistantOptions = assistantsData?.data?.map(assistant => ({
    value: assistant.id,
    label: `${assistant.name} - Lab Assistant`
  })) || [];
  
  // Fetch event details for recalculate mode
  const { data: eventData } = useEventControllerGetById(
    eventId || '',
    {
      query: {
        enabled: !!eventId && isOpen
      }
    }
  );

  // Fetch existing exam models for recalculate mode
  const { data: existingExamModelsData } = useExamModelControllerGetExamModelsForEvent(
    eventId || '',
    {
      query: {
        enabled: !!eventId && isOpen && eventForm.isExam
      }
    }
  );

  // Auto-fill event details when event data is loaded (recalculate mode)
  useEffect(() => {
    if (eventData?.data && eventId && existingGroups) {
      const event = eventData.data;
      setEventForm({
        name: event.name,
        description: event.description || '',
        duration: event.duration,
        eventType: event.eventType,
        locationType: event.locationType,
        customLocation: event.customLocation || '',
        isExam: event.isExam || false,
        hasMarks: event.hasMarks,
        totalMarks: event.totalMarks,
        examModeStartMinutes: event.examModeStartMinutes,
      });
    }
  }, [eventData, eventId, existingGroups]);

  // Load existing exam models when available (recalculate mode)
  useEffect(() => {
    if (existingExamModelsData?.data && eventId && eventForm.isExam) {
      const models = existingExamModelsData.data.map(model => ({
        id: model.id,
        name: model.name,
        files: [],
        uploadedFileIds: []
      }));
      setExamModels(models);
      console.log(`Loaded ${models.length} existing exam models for event ${eventId}`);
    }
  }, [existingExamModelsData, eventId, eventForm.isExam]);

  // Trigger simulation when modal opens
  useEffect(() => {
    if (isOpen && courseId) {
      if (existingGroups && existingGroups.length > 0) {
        setStep('simulation');
        setProposedGroups(existingGroups);
        setGroupAutoStartSettings(existingGroups.map(group => group.autoStart || false));
      }
      
      simulateGroupCreation({ courseId })
        .then((response) => {
          setSimulation(response.data as unknown as GroupCreationSimulationDto);
        })
        .catch((error) => {
          toast.error('Failed to analyze course groups');
        });
    }
  }, [isOpen, courseId, simulateGroupCreation, existingGroups]);

  useEffect(() => {
    if (simulation && step === 'simulation') {
      const initialSchedules = proposedGroups.map((group, index) => ({
        courseGroupId: group.courseGroupId,
        labId: group.labId,
        assistantIds: [],
        maxStudents: group.proposedCapacity,
        date: '',
        time: '09:00',
        autoStart: true
      }));
      setGroupSchedules(initialSchedules);
    }
  }, [simulation, step, proposedGroups]);

  // NEW NAVIGATION LOGIC: event-details -> exam-models (if isExam) -> simulation
  const handleNext = () => {
    if (step === 'event-details') {
      if (eventForm.isExam) {
        setStep('exam-models');
      } else if (eventForm.locationType === 'lab_devices') {
        setStep('simulation');
      } else {
        handleCreateEvent();
      }
    } else if (step === 'exam-models') {
      if (eventForm.locationType === 'lab_devices') {
        setStep('simulation');
      } else {
        handleCreateEvent();
      }
    } else if (step === 'simulation') {
      handleCreateEvent();
    }
  };

  const handleBack = () => {
    if (step === 'simulation') {
      if (eventForm.isExam) {
        setStep('exam-models');
      } else {
        setStep('event-details');
      }
    } else if (step === 'exam-models') {
      setStep('event-details');
    }
  };

  const handleCreateEvent = async () => {
    const validationError = getValidationErrorMessage();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setCreatingEvent(true);
    
    try {
      console.log('🚀 Starting event creation process...');
      
      // Step 1: Upload exam model files FIRST if this is an exam
      let examModelData: any[] = [];
      if (eventForm.isExam && examModels.length > 0) {
        console.log('📚 Uploading exam model files...');
        
        for (const model of examModels) {
          if (model.files.length > 0) {
            try {
              // Upload files to get file IDs
              const formData = new FormData();
              model.files.forEach(file => {
                formData.append('files', file);
              });

              const uploadResponse = await eventControllerUploadExamModelFiles({
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              
              console.log(`✅ Uploaded files for model: ${model.name}`, uploadResponse);
              
              // Store model data with file IDs
              const uploadedFiles = uploadResponse.data?.uploadedFiles || [];
              if (uploadedFiles.length > 0) {
                examModelData.push({
                  name: model.name,
                  description: model.name,
                  fileIds: uploadedFiles.map((file: any) => file.id)
                });
              }
            } catch (error) {
              console.error(`❌ Failed to upload files for model ${model.name}:`, error);
              toast.error(`Failed to upload files for exam model: ${model.name}`);
              throw error; // Stop the process if upload fails
            }
          }
        }
      }

      // Step 2: Prepare event data with uploaded file IDs
      const proposedGroupsData = proposedGroups.map((group, index) => {
        const schedule = groupSchedules[index];
        const dateTime = schedule?.date && schedule?.time 
          ? new Date(`${schedule.date}T${schedule.time}:00`)
          : new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        return {
          labId: group.labId,
          proposedCapacity: group.proposedCapacity,
          autoStart: groupAutoStartSettings[index] || false,
          dateTime: dateTime,
          assistantIds: schedule?.assistantIds || []
        };
      });

      // Prepare model assignments
      const assignmentData = eventForm.isExam ? groupModelAssignments.map(assignment => ({
        groupIndex: assignment.groupIndex,
        assignedModelNames: assignment.assignedModelIds.map(modelId => {
          const model = examModels.find(m => m.id === modelId);
          return model?.name || modelId;
        })
      })) : [];

      const eventData: CreateEventWithGroupsDto = {
        name: eventForm.name,
        description: eventForm.description || '',
        duration: eventForm.duration,
        eventType: (eventForm.eventType in createEventWithGroupsDtoEventTypeEnum) 
          ? eventForm.eventType as keyof typeof createEventWithGroupsDtoEventTypeEnum
          : 'assignment' as const,
        locationType: eventForm.locationType as any,
        customLocation: eventForm.customLocation,
        hasMarks: eventForm.hasMarks,
        totalMarks: eventForm.totalMarks || 0,
        autoStart: false,
        requiresModels: eventForm.isExam && examModels.length > 0,
        isExam: eventForm.isExam,
        examModeStartMinutes: eventForm.examModeStartMinutes || 30,
        courseId: courseId,
        proposedGroups: proposedGroupsData,
        ...(eventForm.isExam && examModelData.length > 0 && {
          examModels: examModelData
        }),
        ...(eventForm.isExam && assignmentData.length > 0 && {
          groupModelAssignments: assignmentData
        })
      };

      console.log('📝 Creating event with uploaded files data:', eventData);

      // Step 3: Create the event with groups and uploaded file references
      const response = await createEventWithGroups({ data: eventData });
      
      console.log('✅ Event creation process completed successfully');
      toast.success('Event created successfully!');
      
      onEventCreated?.();
      onClose();
      
    } catch (error: any) {
      console.error('❌ Error creating event:', error);
      toast.error(error?.response?.data?.message || 'Failed to create event');
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleRetrySimulation = () => {
    if (courseId) {
      simulateGroupCreation({ courseId })
        .then((response) => {
          setSimulation(response.data as unknown as GroupCreationSimulationDto);
        })
        .catch((error) => {
          toast.error('Failed to analyze course groups');
        });
    }
  };

  const updateGroupSchedule = (index: number, field: keyof GroupScheduleForm, value: any) => {
    setGroupSchedules(prev => 
      prev.map((schedule, i) => 
        i === index ? { ...schedule, [field]: value } : schedule
      )
    );
  };

  const handleLabSelect = (labId: string, capacity?: number) => {
    const lab = labsData?.data?.items?.find((l: any) => l.id === labId);
    if (!lab) return;

    const newGroup = {
      labId: labId,
      labName: lab.name,
      proposedCapacity: capacity || 0
    };

    setProposedGroups(prev => [...prev, newGroup]);
    setGroupSchedules(prev => [...prev, {
      courseGroupId: '',
      labId: labId,
      assistantIds: [],
      maxStudents: capacity || 0,
      date: '',
      time: '',
      autoStart: false
    }]);
    setGroupAutoStartSettings(prev => [...prev, false]);
    setShowLabSelectionModal(false);
  };

  const handleRemoveGroup = (index: number) => {
    setProposedGroups(prev => prev.filter((_, i) => i !== index));
    setGroupSchedules(prev => prev.filter((_, i) => i !== index));
    setGroupAutoStartSettings(prev => prev.filter((_, i) => i !== index));
    
    // Remove any model assignments for this group and update indices
    setGroupModelAssignments(prev => 
      prev
        .filter(assignment => assignment.groupIndex !== index)
        .map(assignment => ({
          ...assignment,
          groupIndex: assignment.groupIndex > index ? assignment.groupIndex - 1 : assignment.groupIndex
        }))
    );
  };

  const getTotalCoveredStudents = () => {
    return proposedGroups.reduce((total, group) => total + group.proposedCapacity, 0);
  };

  const getUncoveredStudents = () => {
    return Math.max(0, (simulation?.totalStudents || 0) - getTotalCoveredStudents());
  };

  const handleModelFileChange = async (modelId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    try {
      // Convert FileList to File array and store temporarily
      const fileArray = Array.from(files);
      setExamModels(prev => 
        prev.map(model => 
          model.id === modelId 
            ? { ...model, files: fileArray }
            : model
        )
      );
      
      toast.success(`${files.length} file(s) selected for ${examModels.find(m => m.id === modelId)?.name}`);
    } catch (error) {
      toast.error('Failed to process files');
    }
  };

  const getValidationErrorMessage = (): string | null => {
    if (!eventForm.name.trim()) {
      return 'Event name is required';
    }
    
    if (eventForm.duration <= 0) {
      return 'Event duration must be greater than 0';
    }
    
    if (eventForm.hasMarks && (!eventForm.totalMarks || eventForm.totalMarks <= 0)) {
      return 'Total marks must be specified when event has marks';
    }

    if (eventForm.isExam && (!eventForm.examModeStartMinutes || eventForm.examModeStartMinutes <= 0)) {
      return 'Exam mode start minutes must be specified for exams';
    }

    // Check for uncovered students
    const totalStudents = studentsData?.data?.length || 0;
    const coveredStudents = proposedGroups.reduce((sum, group) => sum + (group.proposedCapacity || 0), 0);
    const uncoveredStudents = Math.max(0, totalStudents - coveredStudents);
    
    if (uncoveredStudents > 0) {
      return `${uncoveredStudents} students are not covered by any group`;
    }

    // Check for groups without exam models if it's an exam
    if (eventForm.isExam && proposedGroups.length > 0) {
      const groupsWithoutModels = proposedGroups.some((_, index) => {
        const assignment = groupModelAssignments.find(a => a.groupIndex === index);
        return !assignment || assignment.assignedModelIds.length === 0;
      });
      
      if (groupsWithoutModels) {
        return 'All groups in an exam must have at least one exam model assigned';
      }
    }

    return null;
  };

  const canProceedToNextStep = () => {
    if (step === 'event-details') {
      return eventForm.name.trim() && eventForm.duration > 0;
    }
    
    if (step === 'exam-models') {
      return !eventForm.isExam || examModels.length > 0;
    }
    
    if (step === 'simulation') {
      return getValidationErrorMessage() === null;
    }
    
    return false;
  };

  // Exam Model Management Functions
  const addExamModel = () => {
    const newModel: ExamModel = {
      id: `model-${Date.now()}`,
      name: `Exam Model ${examModels.length + 1}`,
      files: [],
      uploadedFileIds: []
    };
    setExamModels(prev => [...prev, newModel]);
  };

  const removeExamModel = (modelId: string) => {
    setExamModels(prev => prev.filter(model => model.id !== modelId));
    // Also remove any assignments for this model
    setGroupModelAssignments(prev => 
      prev.map(assignment => ({
        ...assignment,
        assignedModelIds: assignment.assignedModelIds.filter(id => id !== modelId)
      }))
    );
  };

  const updateExamModelFiles = (modelId: string, files: File[]) => {
    setExamModels(prev => 
      prev.map(model => 
        model.id === modelId 
          ? { ...model, files }
          : model
      )
    );
  };

  const toggleModelAssignment = (groupIndex: number, modelId: string) => {
    setGroupModelAssignments(prev => {
      const existingAssignment = prev.find(a => a.groupIndex === groupIndex);
      
      if (existingAssignment) {
        // Update existing assignment
        return prev.map(assignment => 
          assignment.groupIndex === groupIndex
            ? {
                ...assignment,
                assignedModelIds: assignment.assignedModelIds.includes(modelId)
                  ? assignment.assignedModelIds.filter(id => id !== modelId)
                  : [...assignment.assignedModelIds, modelId]
              }
            : assignment
        );
      } else {
        // Create new assignment
        return [...prev, {
          groupIndex,
          assignedModelIds: [modelId]
        }];
      }
    });
  };

  const isModelAssignedToGroup = (groupIndex: number, modelId: string): boolean => {
    const assignment = groupModelAssignments.find(a => a.groupIndex === groupIndex);
    return assignment ? assignment.assignedModelIds.includes(modelId) : false;
  };

  // AutoStart Management Functions
  const toggleGroupAutoStart = (groupIndex: number) => {
    setGroupAutoStartSettings(prev => {
      const updated = [...prev];
      updated[groupIndex] = !updated[groupIndex];
      
      if (!updated[groupIndex]) {
        setAutoStartAll(false);
      } else {
        const allChecked = updated.every(setting => setting);
        if (allChecked) {
          setAutoStartAll(true);
        }
      }
      
      return updated;
    });
  };

  const handleAutoStartAllChange = (checked: boolean) => {
    setAutoStartAll(checked);
    setGroupAutoStartSettings(prev => 
      proposedGroups.map(() => checked)
    );
  };

  // Update autoStart settings when groups change
  useEffect(() => {
    setGroupAutoStartSettings(prev => {
      const updated = [...prev];
      while (updated.length < proposedGroups.length) {
        updated.push(true);
      }
      const newSettings = updated.slice(0, proposedGroups.length);
      
      const allChecked = newSettings.length > 0 && newSettings.every(setting => setting);
      setAutoStartAll(allChecked);
      
      return newSettings;
    });
  }, [proposedGroups.length]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Create Event with Groups - {courseName}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <LuX className="h-6 w-6" />
                  </button>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-8">
                    <div className={`flex items-center ${step === 'event-details' ? 'text-primary' : 'text-green-600'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'event-details' ? 'border-primary bg-primary text-white' : 'border-green-600 bg-green-600 text-white'}`}>
                        {step !== 'event-details' ? <LuCheck className="w-4 h-4" /> : '1'}
                      </div>
                      <span className="ml-2 font-medium">Event Details</span>
                    </div>

                    {eventForm.isExam && (
                      <div className={`flex items-center ${step === 'exam-models' ? 'text-primary' : step === 'simulation' ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'exam-models' ? 'border-primary bg-primary text-white' : step === 'simulation' ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'}`}>
                          {step === 'simulation' ? <LuCheck className="w-4 h-4" /> : '2'}
                        </div>
                        <span className="ml-2 font-medium">Exam Models</span>
                      </div>
                    )}

                    {eventForm.locationType === 'lab_devices' && (
                      <div className={`flex items-center ${step === 'simulation' ? 'text-primary' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'simulation' ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                          {eventForm.isExam ? '3' : '2'}
                        </div>
                        <span className="ml-2 font-medium">Group Simulation</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Details Step */}
                {step === 'event-details' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Name *
                      </label>
                      <input
                        type="text"
                        value={eventForm.name}
                        onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        placeholder="Enter event name..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={eventForm.description}
                        onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        placeholder="Enter event description..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        value={eventForm.duration}
                        onChange={(e) => setEventForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Type *
                      </label>
                      <select
                        value={eventForm.eventType}
                        onChange={(e) => setEventForm(prev => ({ ...prev, eventType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      >
                        <option value="assignment">Assignment</option>
                        <option value="exam">Exam</option>
                        <option value="quiz">Quiz</option>
                        <option value="lab_assignment">Lab Assignment</option>
                        <option value="project">Project</option>
                        <option value="presentation">Presentation</option>
                        <option value="workshop">Workshop</option>
                        <option value="practice">Practice</option>
                        <option value="seminar">Seminar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location Type *
                      </label>
                      <select
                        value={eventForm.locationType}
                        onChange={(e) => setEventForm(prev => ({ ...prev, locationType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      >
                        <option value="lab_devices">Lab Devices</option>
                        <option value="lecture_hall">Lecture Hall</option>
                        <option value="online">Online</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>

                    {eventForm.locationType !== 'lab_devices' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Location
                        </label>
                        <input
                          type="text"
                          value={eventForm.customLocation}
                          onChange={(e) => setEventForm(prev => ({ ...prev, customLocation: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                          placeholder="Enter specific location..."
                        />
                      </div>
                    )}

                    {eventForm.locationType === 'lab_devices' && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isExam"
                          checked={eventForm.isExam}
                          onChange={(e) => setEventForm(prev => ({ ...prev, isExam: e.target.checked }))}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="isExam" className="text-sm font-medium text-gray-700">
                          This is an exam (requires exam models)
                        </label>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasMarks"
                        checked={eventForm.hasMarks}
                        onChange={(e) => setEventForm(prev => ({ ...prev, hasMarks: e.target.checked }))}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="hasMarks" className="text-sm font-medium text-gray-700">
                        This event has marks
                      </label>
                    </div>

                    {eventForm.hasMarks && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Marks *
                        </label>
                        <input
                          type="number"
                          value={eventForm.totalMarks || ''}
                          onChange={(e) => setEventForm(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || undefined }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                          min="1"
                          placeholder="Enter total marks..."
                        />
                      </div>
                    )}

                    {eventForm.isExam && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Exam Mode Start Minutes *
                        </label>
                        <input
                          type="number"
                          value={eventForm.examModeStartMinutes}
                          onChange={(e) => setEventForm(prev => ({ ...prev, examModeStartMinutes: parseInt(e.target.value) || 30 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                          min="1"
                          placeholder="Minutes before exam starts..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Number of minutes before the scheduled time that students can access the exam
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Exam Models Step */}
                {step === 'exam-models' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex">
                        <LuGraduationCap className="h-5 w-5 text-blue-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Exam Models Setup</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>Create exam models that will be assigned to student groups. Each model can contain multiple files.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium">Exam Models</h4>
                      <button
                        type="button"
                        onClick={addExamModel}
                        className="btn btn-primary flex items-center"
                      >
                        <LuPlus className="w-4 h-4 mr-2" />
                        Add Model
                      </button>
                    </div>

                    <div className="space-y-4">
                      {examModels.map((model) => (
                        <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium">{model.name}</h5>
                            <button
                              type="button"
                              onClick={() => removeExamModel(model.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <LuMinus className="w-5 h-5" />
                            </button>
                          </div>
                          <input
                            type="file"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              handleModelFileChange(model.id, e.target.files);
                            }}
                            className="w-full"
                          />
                          {model.files.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                              {model.files.length} file(s) selected
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Simulation Step */}
                {step === 'simulation' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex">
                        <LuUsers className="h-5 w-5 text-blue-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Group Simulation</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>Configure groups for your event. Each group will need a lab assignment and schedule.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CourseStudentsStats courseId={courseId} proposedGroups={proposedGroups} />
                    
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium">Event Groups</h4>
                      <button
                        type="button"
                        onClick={() => setShowLabSelectionModal(true)}
                        className="btn btn-primary flex items-center"
                      >
                        <LuPlus className="w-4 h-4 mr-2" />
                        Add Group
                      </button>
                    </div>

                    <div className="space-y-4">
                      {proposedGroups.map((group, index) => (
                        <GroupCard
                          key={index}
                          group={group}
                          index={index}
                          groupSchedules={groupSchedules}
                          updateGroupSchedule={updateGroupSchedule}
                          examModels={examModels}
                          groupModelAssignments={groupModelAssignments}
                          toggleModelAssignment={toggleModelAssignment}
                          isModelAssignedToGroup={isModelAssignedToGroup}
                          autoStart={groupAutoStartSettings[index] || false}
                          onAutoStartChange={(checked) => {
                            const newSettings = [...groupAutoStartSettings];
                            newSettings[index] = checked;
                            setGroupAutoStartSettings(newSettings);
                          }}
                          onRemoveGroup={() => handleRemoveGroup(index)}
                          isExam={eventForm.isExam}
                        />
                      ))}
                    </div>

                    {proposedGroups.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <LuUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Created</h3>
                        <p className="text-gray-600 mb-4">Start by adding a group to schedule your event</p>
                        <button
                          type="button"
                          onClick={() => setShowLabSelectionModal(true)}
                          className="btn btn-primary"
                        >
                          Add First Group
                        </button>
                      </div>
                    )}

                    {/* Validation Messages */}
                    <ValidationMessages 
                      courseId={courseId}
                      proposedGroups={proposedGroups}
                      isExam={eventForm.isExam}
                      groupModelAssignments={groupModelAssignments}
                    />
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <div>
                    {step !== 'event-details' && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="btn btn-outline-secondary"
                      >
                        Back
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn btn-outline-secondary"
                    >
                      Cancel
                    </button>

                    {step === 'simulation' ? (
                      <button
                        type="button"
                        onClick={handleCreateEvent}
                        disabled={creatingEvent || !canProceedToNextStep()}
                        className={`btn btn-primary ${creatingEvent || !canProceedToNextStep() ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {creatingEvent ? 'Creating Event...' : 'Create Event with Groups'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canProceedToNextStep()}
                        className={`btn btn-primary ${!canProceedToNextStep() ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {step === 'event-details' ? 
                          (eventForm.isExam ? 'Next: Exam Models' :
                           eventForm.locationType === 'lab_devices' ? 'Next: Group Simulation' : 
                           'Create Event') :
                          step === 'exam-models' ?
                            (eventForm.locationType === 'lab_devices' ? 'Next: Group Simulation' : 'Create Event') :
                            'Next'
                        }
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>

      {/* Lab Selection Modal */}
      <LabSelectionModal
        isOpen={showLabSelectionModal}
        onClose={() => setShowLabSelectionModal(false)}
        availableLabs={labsData?.data?.items || []}
        onLabSelect={handleLabSelect}
        totalStudents={studentsData?.data?.length || 0}
        uncoveredStudents={Math.max(0, (studentsData?.data?.length || 0) - proposedGroups.reduce((sum, group) => sum + (group.proposedCapacity || 0), 0))}
        courseId={courseId}
      />
    </Transition>
  );
};

export default GroupCreationModal; 