import { useState } from "react";
import { LuCalendar, LuClock, LuMapPin, LuUsers, LuBook, LuRefreshCw } from "react-icons/lu";
import { useStudentCourseControllerGetStudentWeeklySchedule } from "../../../generated/hooks/student-coursesHooks/useStudentCourseControllerGetStudentWeeklySchedule";
import { useAuthStore } from "../../../store/authStore";
import { StudentWeeklyScheduleDto } from "../../../generated/types/StudentWeeklyScheduleDto";

const SchedulePage = () => {
  const { user } = useAuthStore();
  const [refreshKey, setRefreshKey] = useState(0);

  const { 
    data: scheduleData, 
    isLoading, 
    error,
    refetch 
  } = useStudentCourseControllerGetStudentWeeklySchedule(
    user?.id || '', 
    {
      query: {
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true
      }
    }
  );

  const schedule = scheduleData?.data || [];

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const minute = minutes || '00';
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minute} ${period}`;
    } catch {
      return time;
    }
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const groupScheduleByDay = (schedules: StudentWeeklyScheduleDto[]) => {
    const grouped: Record<string, StudentWeeklyScheduleDto[]> = {};
    weekDays.forEach(day => {
      grouped[day] = schedules.filter(s => s.weekDay === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  };

  const groupedSchedule = groupScheduleByDay(schedule);
  const hasAnySchedule = schedule.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading your weekly schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Schedule</h2>
          <p className="text-gray-600 mb-4">Unable to retrieve your weekly schedule</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-light rounded-lg">
                <LuCalendar className="text-primary" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Weekly Schedule</h1>
                <p className="text-gray-600">Your course group lab sessions for this week</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <LuRefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {!hasAnySchedule ? (
          /* No Schedule */
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Scheduled Lab Sessions</h2>
            <p className="text-gray-600 mb-4">
              You don't have any scheduled lab sessions this week.
            </p>
            <div className="text-sm text-gray-500">
              <p>This could mean:</p>
              <ul className="mt-2 space-y-1">
                <li>• You're not enrolled in any lab courses</li>
                <li>• Your course groups don't have schedules assigned yet</li>
                <li>• Your courses only have theoretical sessions</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Schedule Grid */
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-7 min-h-[600px]">
              {weekDays.map((day, dayIndex) => (
                <div key={day} className={`border-r border-gray-200 ${dayIndex === weekDays.length - 1 ? 'border-r-0' : ''}`}>
                  {/* Day Header */}
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 text-center">{day}</h3>
                    {groupedSchedule[day].length > 0 && (
                      <p className="text-xs text-gray-500 text-center mt-1">
                        {groupedSchedule[day].length} session{groupedSchedule[day].length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Day Schedule */}
                  <div className="p-2 space-y-2 min-h-[500px]">
                    {groupedSchedule[day].length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        No sessions
                      </div>
                    ) : (
                      groupedSchedule[day].map((session, sessionIndex) => (
                        <div
                          key={`${session.courseId}-${session.weekDay}-${session.startTime}-${sessionIndex}`}
                          className="bg-primary-light border border-primary/20 rounded-lg p-3 hover:shadow-md transition-shadow"
                        >
                          {/* Course Info */}
                          <div className="mb-2">
                            <h4 className="font-semibold text-primary text-sm mb-1">
                              {session.courseCode}
                            </h4>
                            <p className="text-xs text-gray-700 font-medium">
                              {session.courseName}
                            </p>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-1 mb-2">
                            <LuClock className="text-gray-500" size={12} />
                            <span className="text-xs text-gray-600">
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </span>
                          </div>

                          {/* Group */}
                          <div className="flex items-center gap-1 mb-2">
                            <LuUsers className="text-gray-500" size={12} />
                            <span className="text-xs text-gray-600">
                              {session.groupName}
                            </span>
                          </div>

                          {/* Lab */}
                          <div className="flex items-center gap-1 mb-2">
                            <LuMapPin className="text-gray-500" size={12} />
                            <span className="text-xs text-gray-600">
                              {session.labName}
                            </span>
                          </div>

                          {/* Teaching Assistants */}
                          {session.teachingAssistants.length > 0 && (
                            <div className="flex items-start gap-1">
                              <LuBook className="text-gray-500 mt-0.5" size={12} />
                              <div className="flex-1">
                                <span className="text-xs text-gray-600">
                                  {session.teachingAssistants.join(', ')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Summary */}
        {hasAnySchedule && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary-light rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">
                  {schedule.length}
                </div>
                <div className="text-sm text-gray-600">
                  Total Lab Sessions
                </div>
              </div>
              <div className="text-center p-4 bg-secondary-light rounded-lg">
                <div className="text-2xl font-bold text-secondary mb-1">
                  {new Set(schedule.map(s => s.courseId)).size}
                </div>
                <div className="text-sm text-gray-600">
                  Enrolled Courses
                </div>
              </div>
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {weekDays.filter(day => groupedSchedule[day].length > 0).length}
                </div>
                <div className="text-sm text-gray-600">
                  Active Days
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
