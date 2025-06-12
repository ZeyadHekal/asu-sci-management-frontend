import { LuTrendingUp, LuTrendingDown, LuMinus, LuGraduationCap, LuCalendar, LuCheck, LuX, LuEye } from 'react-icons/lu';
import { useEventControllerGetMyGrades } from '../../../generated/hooks/eventsHooks';
import { useAuthStore } from '../../../store/authStore';

const MyGradesWidget = () => {
  const { user } = useAuthStore();

  const { data: myGradesData, isLoading, error } = useEventControllerGetMyGrades(
    user?.id || '', 
    {
      query: { enabled: !!user?.id }
    }
  );

  const courseGrades = myGradesData?.data || [];

  const getGradeColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 85) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const getTrendIcon = (eventMarks: any[]) => {
    if (eventMarks.length < 2) return <LuMinus className="h-4 w-4 text-gray-400" />;
    
    const recentMarks = eventMarks.slice(-2);
    const trend = recentMarks[1].percentage - recentMarks[0].percentage;
    
    if (trend > 5) return <LuTrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -5) return <LuTrendingDown className="h-4 w-4 text-red-500" />;
    return <LuMinus className="h-4 w-4 text-gray-400" />;
  };

  const overallStats = courseGrades.reduce(
    (acc, course) => ({
      totalMarks: acc.totalMarks + course.totalMarks,
      earnedMarks: acc.earnedMarks + course.earnedMarks,
      totalEvents: acc.totalEvents + course.eventMarks.length
    }),
    { totalMarks: 0, earnedMarks: 0, totalEvents: 0 }
  );

  const overallPercentage = overallStats.totalMarks > 0 
    ? (overallStats.earnedMarks / overallStats.totalMarks) * 100 
    : 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || courseGrades.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">My Grades</h3>
          <LuGraduationCap className="h-5 w-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <LuGraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No grades available yet</p>
          <p className="text-sm text-gray-500 mt-1">Complete some assignments to see your grades here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">My Grades</h3>
        <LuGraduationCap className="h-5 w-5 text-gray-400" />
      </div>

      {/* Overall Stats */}
      <div className={`p-4 rounded-lg border mb-6 ${getGradeColor(overallPercentage)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">Overall Performance</p>
            <p className="text-2xl font-bold">
              {getGradeLetter(overallPercentage)} ({overallPercentage.toFixed(1)}%)
            </p>
            <p className="text-sm opacity-75">
              {overallStats.earnedMarks} / {overallStats.totalMarks} points
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Total Events</p>
            <p className="text-lg font-bold">{overallStats.totalEvents}</p>
          </div>
        </div>
      </div>

      {/* Course Grades */}
      <div className="space-y-4">
        {courseGrades.map((course, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Course {index + 1}</h4>
                <p className="text-sm text-gray-600">
                  {course.eventMarks.length} events completed
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {getTrendIcon(course.eventMarks)}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(course.percentage)}`}>
                  {getGradeLetter(course.percentage)} ({course.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{course.earnedMarks} / {course.totalMarks} points</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${course.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Recent Events */}
            {course.eventMarks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Recent Events</p>
                {course.eventMarks.slice(-3).map((event) => (
                  <div key={event.eventScheduleId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${event.hasAttended ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-gray-700 truncate max-w-32">{event.eventName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">
                        {event.mark || 0}/{event.totalMarks}
                      </span>
                      <span className="text-gray-500">
                        ({event.percentage?.toFixed(0) || 0}%)
                      </span>
                    </div>
                  </div>
                ))}
                {course.eventMarks.length > 3 && (
                  <p className="text-xs text-gray-500">+{course.eventMarks.length - 3} more events</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white border border-primary rounded-md transition-colors">
          <LuEye className="h-4 w-4 mr-2" />
          View Detailed Grades
        </button>
      </div>
    </div>
  );
};

export default MyGradesWidget; 