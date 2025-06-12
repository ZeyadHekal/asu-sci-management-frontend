import { useState } from 'react';
import { LuTrendingUp, LuTrendingDown, LuMinus, LuGraduationCap, LuCalendar, LuCheck, LuX, LuSearch, LuDownload } from 'react-icons/lu';
import { useEventControllerGetStudentGradesSummary } from '../../../generated/hooks/eventsHooks/useEventControllerGetStudentGradesSummary';
import { StudentGradesSummaryDto } from '../../../generated/types/StudentGradesSummaryDto';
import { EventMarkDto } from '../../../generated/types/EventMarkDto';

interface StudentGradesDashboardProps {
  courseId: string;
  courseName: string;
}

interface GradeStats {
  totalStudents: number;
  passedStudents: number;
  averagePercentage: number;
  highestPercentage: number;
  lowestPercentage: number;
}

const StudentGradesDashboard = ({ courseId, courseName }: StudentGradesDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'percentage' | 'totalMarks'>('percentage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: gradesData, isLoading, error } = useEventControllerGetStudentGradesSummary(courseId);

  const studentGrades = gradesData?.data || [];

  // Calculate statistics
  const calculateStats = (grades: StudentGradesSummaryDto[]): GradeStats => {
    if (grades.length === 0) {
      return {
        totalStudents: 0,
        passedStudents: 0,
        averagePercentage: 0,
        highestPercentage: 0,
        lowestPercentage: 0
      };
    }

    const percentages = grades.map(g => g.percentage);
    const passedStudents = grades.filter(g => g.percentage >= 60).length; // Assuming 60% is passing

    return {
      totalStudents: grades.length,
      passedStudents,
      averagePercentage: percentages.reduce((sum, p) => sum + p, 0) / percentages.length,
      highestPercentage: Math.max(...percentages),
      lowestPercentage: Math.min(...percentages)
    };
  };

  // Filter and sort students
  const filteredAndSortedStudents = studentGrades
    .filter(student => 
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.seatNo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case 'name':
          aValue = a.studentName;
          bValue = b.studentName;
          break;
        case 'percentage':
          aValue = a.percentage;
          bValue = b.percentage;
          break;
        case 'totalMarks':
          aValue = a.earnedMarks;
          bValue = b.earnedMarks;
          break;
        default:
          aValue = a.percentage;
          bValue = b.percentage;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      }
    });

  const stats = calculateStats(studentGrades);

  const getGradeColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600 bg-green-50';
    if (percentage >= 70) return 'text-blue-600 bg-blue-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <LuX className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Grades</h3>
          <p className="text-gray-600">Failed to load student grades. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Grades</h2>
          <p className="text-gray-600">{courseName}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-outline-primary">
            <LuDownload className="h-4 w-4 mr-2" />
            Export Grades
          </button>
          <button className="btn btn-outline-primary">
            <LuTrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <LuGraduationCap className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <LuCheck className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Passed Students</p>
              <p className="text-2xl font-bold text-green-600">{stats.passedStudents}</p>
              <p className="text-xs text-gray-500">{((stats.passedStudents / stats.totalStudents) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <LuTrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Class Average</p>
              <p className="text-2xl font-bold text-purple-600">{stats.averagePercentage.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Grade {getGradeLetter(stats.averagePercentage)}</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <div className="flex items-center">
            <LuTrendingUp className="h-8 w-8 text-emerald-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Highest Score</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.highestPercentage.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Grade {getGradeLetter(stats.highestPercentage)}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <LuTrendingDown className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Lowest Score</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lowestPercentage.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Grade {getGradeLetter(stats.lowestPercentage)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="percentage">Percentage</option>
            <option value="name">Name</option>
            <option value="totalMarks">Total Marks</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-primary focus:border-primary"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedStudents.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                          {student.studentName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                        <div className="text-sm text-gray-500">@{student.username}</div>
                        {student.seatNo && (
                          <div className="text-xs text-gray-400">Seat: {student.seatNo}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(student.percentage)}`}>
                        {getGradeLetter(student.percentage)} ({student.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.earnedMarks} / {student.totalMarks}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(student.earnedMarks / student.totalMarks) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {student.eventMarks.slice(0, 3).map((event) => (
                        <div key={event.eventScheduleId} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 truncate max-w-32">{event.eventName}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-1.5 py-0.5 rounded ${event.hasAttended ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {event.hasAttended ? <LuCheck className="h-3 w-3" /> : <LuX className="h-3 w-3" />}
                            </span>
                            <span className="text-gray-900 font-medium">
                              {event.mark || 0}/{event.totalMarks}
                            </span>
                          </div>
                        </div>
                      ))}
                      {student.eventMarks.length > 3 && (
                        <div className="text-xs text-gray-400">
                          +{student.eventMarks.length - 3} more events
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTrendIcon(student.eventMarks)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedStudents.length === 0 && (
          <div className="text-center py-12">
            <LuSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No students match your search criteria.' : 'No grades data available for this course.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGradesDashboard; 