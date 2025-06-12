import React from 'react';
import { FaTrophy, FaGraduationCap } from 'react-icons/fa';
import { LuActivity, LuTrendingUp, LuTrendingDown, LuMinus } from 'react-icons/lu';
import { useAuthStore } from '../../../store/authStore';
import { useEventControllerGetMyGrades } from '../../../generated';

const MyGradesWidget: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  
  const { data: gradesData, isLoading } = useEventControllerGetMyGrades(
    user?.id || '',
    {
      query: {
        enabled: !!user?.id
      }
    }
  );

  const grades = gradesData?.data;

  if (isLoading) {
    return (
      <div className="panel h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!grades || grades.length === 0) {
    return (
      <div className="panel h-[300px]">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-semibold flex items-center gap-2">
            <FaGraduationCap className="text-primary" />
            My Grades
          </h5>
        </div>
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <FaGraduationCap className="text-4xl mb-2 opacity-50" />
          <p>No grades available yet</p>
        </div>
      </div>
    );
  }

  // Calculate overall statistics
  const totalEvents = grades.reduce((sum, course) => sum + course.eventMarks.length, 0);
  const totalMarks = grades.reduce((sum, course) => sum + course.totalMarks, 0);
  const earnedMarks = grades.reduce((sum, course) => sum + course.earnedMarks, 0);
  const overallPercentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;

  // Get recent performance (average of course percentages)
  const recentAverage = grades.length > 0 
    ? Math.round(grades.reduce((sum, course) => sum + course.percentage, 0) / grades.length)
    : 0;

  const getTrendIcon = (percentage: number) => {
    if (percentage >= 85) return <LuTrendingUp className="text-green-500" />;
    if (percentage >= 70) return <LuMinus className="text-yellow-500" />;
    return <LuTrendingDown className="text-red-500" />;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="panel h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold flex items-center gap-2">
          <FaGraduationCap className="text-primary" />
          My Grades Overview
        </h5>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <LuActivity className="h-4 w-4" />
          {totalEvents} Events
        </div>
      </div>

      <div className="space-y-4">
        {/* Overall Performance */}
        <div className="bg-gradient-to-r from-primary-light to-primary rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Overall Performance</p>
              <p className="text-2xl font-bold">{overallPercentage}%</p>
              <p className="text-xs opacity-75">{earnedMarks}/{totalMarks} points</p>
            </div>
            <div className="text-3xl opacity-80">
              <FaTrophy />
            </div>
          </div>
        </div>

        {/* Recent Performance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Recent Average</p>
              {getTrendIcon(recentAverage)}
            </div>
            <p className={`text-xl font-semibold ${getGradeColor(recentAverage)}`}>
              {recentAverage}%
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active Courses</p>
              <LuTrendingUp className="text-blue-500" />
            </div>
            <p className="text-xl font-semibold text-blue-600">
              {grades.length}
            </p>
          </div>
        </div>

        {/* Course Breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Course Performance</p>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {grades.slice(0, 3).map((course, index) => {
              return (
                <div key={course.studentId + index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate" title={course.studentName}>
                    Course {index + 1}
                  </span>
                  <span className={`font-semibold ${getGradeColor(course.percentage)}`}>
                    {Math.round(course.percentage)}%
                  </span>
                </div>
              );
            })}
            {grades.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{grades.length - 3} more courses
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyGradesWidget; 