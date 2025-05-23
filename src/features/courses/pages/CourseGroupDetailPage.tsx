import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuArrowLeft, LuPlus, LuUsers, LuUserPlus, LuUserMinus } from "react-icons/lu";
import { BiSelectMultiple } from "react-icons/bi";
import { MdSwapHoriz } from "react-icons/md";

// Mock course data
const courseData = [
    {
        id: 1,
        courseCode: "CS258",
        courseName: "Operating Systems",
        assignedDoctors: "Dr. Salma Youssef",
        courseType: "Practical",
        software: "N/A",
        totalStudents: 120
    },
    {
        id: 3,
        courseCode: "CS260",
        courseName: "Database Systems",
        assignedDoctors: "Dr. Fatma El-Sayed",
        courseType: "Practical",
        software: "MySQL",
        totalStudents: 100
    }
];

// Mock groups data
const groupsData = [
    {
        id: 1,
        courseId: 1,
        groupName: "Group A",
        lab: "Lab B2-215",
        day: "Sunday",
        startTime: "10:00",
        endTime: "12:00",
        assistants: ["TA Ahmed", "TA Sara"],
        enrolledStudents: 25,
        capacity: 30
    },
    // ... other groups
];

// Mock student data for the group
const studentsData = [
    {
        id: 1,
        name: "Ahmed Mohamed",
        studentId: "20201234",
        email: "ahmed.mohamed@example.com",
        groupId: 1,
        attendanceRate: 95,
        grades: {
            midterm: 42,
            final: null,
            assignments: 38,
            total: 80
        }
    },
    {
        id: 2,
        name: "Sara Ahmed",
        studentId: "20205678",
        email: "sara.ahmed@example.com",
        groupId: 1,
        attendanceRate: 90,
        grades: {
            midterm: 39,
            final: null,
            assignments: 40,
            total: 79
        }
    },
    {
        id: 3,
        name: "Mohamed Ibrahim",
        studentId: "20209012",
        email: "mohamed.ibrahim@example.com",
        groupId: 1,
        attendanceRate: 85,
        grades: {
            midterm: 36,
            final: null,
            assignments: 35,
            total: 71
        }
    },
    {
        id: 4,
        name: "Fatma Ali",
        studentId: "20203456",
        email: "fatma.ali@example.com",
        groupId: 1,
        attendanceRate: 100,
        grades: {
            midterm: 45,
            final: null,
            assignments: 42,
            total: 87
        }
    },
    {
        id: 5,
        name: "Ali Hassan",
        studentId: "20207890",
        email: "ali.hassan@example.com",
        groupId: 1,
        attendanceRate: 80,
        grades: {
            midterm: 38,
            final: null,
            assignments: 37,
            total: 75
        }
    },
    {
        id: 6,
        name: "Nour Khaled",
        studentId: "20208901",
        email: "nour.khaled@example.com",
        groupId: 1,
        attendanceRate: 95,
        grades: {
            midterm: 40,
            final: null,
            assignments: 39,
            total: 79
        }
    },
    {
        id: 7,
        name: "Khaled Mahmoud",
        studentId: "20202345",
        email: "khaled.mahmoud@example.com",
        groupId: 1,
        attendanceRate: 90,
        grades: {
            midterm: 37,
            final: null,
            assignments: 36,
            total: 73
        }
    },
    {
        id: 8,
        name: "Amal Samir",
        studentId: "20206789",
        email: "amal.samir@example.com",
        groupId: 1,
        attendanceRate: 100,
        grades: {
            midterm: 43,
            final: null,
            assignments: 41,
            total: 84
        }
    }
];

// Mock data for other groups in the same course (for group transfer)
const otherGroupsData = [
    {
        id: 2,
        courseId: 1,
        groupName: "Group B",
        lab: "Lab B2-215",
        day: "Monday",
        startTime: "10:00",
        endTime: "12:00",
        capacity: 30,
        enrolledStudents: 28
    },
    {
        id: 3,
        courseId: 1,
        groupName: "Group C",
        lab: "Lab B2-216",
        day: "Tuesday",
        startTime: "13:00",
        endTime: "15:00",
        capacity: 30,
        enrolledStudents: 22
    },
    {
        id: 4,
        courseId: 1,
        groupName: "Group D",
        lab: "Lab B2-216",
        day: "Wednesday",
        startTime: "13:00",
        endTime: "15:00",
        capacity: 30,
        enrolledStudents: 20
    },
    {
        id: 5,
        courseId: 1,
        groupName: "Group E",
        lab: "Lab B2-217",
        day: "Thursday",
        startTime: "10:00",
        endTime: "12:00",
        capacity: 30,
        enrolledStudents: 15
    },
    {
        id: 6,
        courseId: 1,
        groupName: "Group F",
        lab: "Lab B2-217",
        day: "Thursday",
        startTime: "13:00",
        endTime: "15:00",
        capacity: 30,
        enrolledStudents: 10
    }
];

const CourseGroupDetailPage = () => {
    const { courseId, groupId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<any>(null);
    const [group, setGroup] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
    const [showTransferPanel, setShowTransferPanel] = useState(false);
    const [targetGroupId, setTargetGroupId] = useState<number | null>(null);

    useEffect(() => {
        // In a real app, fetch course and group data from an API
        const cId = parseInt(courseId || "0");
        const gId = parseInt(groupId || "0");

        const foundCourse = courseData.find(c => c.id === cId);
        const foundGroup = groupsData.find(g => g.id === gId && g.courseId === cId);

        if (foundCourse && foundGroup) {
            setCourse(foundCourse);
            setGroup(foundGroup);

            // Fetch students for this group
            const groupStudents = studentsData.filter(s => s.groupId === gId);
            setStudents(groupStudents);
            setFilteredStudents(groupStudents);
        } else {
            // Handle course or group not found
            navigate(`/courses/${courseId}/groups`);
        }
    }, [courseId, groupId, navigate]);

    useEffect(() => {
        if (students.length > 0) {
            const filtered = students.filter(student =>
                student.name.toLowerCase().includes(search.toLowerCase()) ||
                student.studentId.includes(search) ||
                student.email.toLowerCase().includes(search.toLowerCase())
            );

            setFilteredStudents(filtered);
        }
    }, [search, students]);

    if (!course || !group) {
        return <div className="p-6">Loading group data...</div>;
    }

    const handleTransferStudents = () => {
        if (!targetGroupId || selectedStudents.length === 0) return;

        // In a real app, you would send an API request to transfer students
        console.log(`Transferring ${selectedStudents.length} students to Group ${targetGroupId}`);

        // Update UI (simulating a successful transfer)
        setStudents(prevStudents =>
            prevStudents.filter(student => !selectedStudents.some(s => s.id === student.id))
        );
        setSelectedStudents([]);
        setShowTransferPanel(false);
        setTargetGroupId(null);
    };

    const formatTime = (time24h: string) => {
        try {
            const [hours, minutes] = time24h.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));

            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        } catch (error) {
            return time24h;
        }
    };

    return (
        <div className="panel mt-6">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(`/courses/${courseId}/groups`)}
                        className="flex items-center gap-1 text-secondary hover:text-secondary-dark"
                    >
                        <LuArrowLeft size={14} />
                        <span>Back to Groups</span>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">{group.groupName}</h1>
                        <p className="text-gray-600">
                            {course.courseName} ({course.courseCode}) • {group.lab} • {group.day} • {formatTime(group.startTime)} - {formatTime(group.endTime)}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {selectedStudents.length > 0 && (
                            <button
                                onClick={() => setShowTransferPanel(true)}
                                className="px-4 py-2 bg-primary text-white rounded-md text-sm flex items-center gap-1"
                            >
                                <MdSwapHoriz size={16} />
                                <span>Transfer {selectedStudents.length} Student{selectedStudents.length > 1 ? 's' : ''}</span>
                            </button>
                        )}

                        <button
                            className="px-4 py-2 bg-secondary text-white rounded-md text-sm"
                            onClick={() => {/* Edit group details */ }}
                        >
                            Edit Group
                        </button>
                    </div>
                </div>
            </div>

            {/* Group Details Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-md border">
                    <p className="text-xs text-gray-500">Teaching Assistants</p>
                    <p className="font-medium">{group.assistants.join(", ")}</p>
                </div>

                <div className="bg-white p-4 rounded-md border">
                    <p className="text-xs text-gray-500">Lab</p>
                    <p className="font-medium">{group.lab}</p>
                </div>

                <div className="bg-white p-4 rounded-md border">
                    <p className="text-xs text-gray-500">Schedule</p>
                    <p className="font-medium">{group.day}, {formatTime(group.startTime)} - {formatTime(group.endTime)}</p>
                </div>

                <div className="bg-white p-4 rounded-md border">
                    <p className="text-xs text-gray-500">Capacity</p>
                    <div className="flex items-center gap-1">
                        <span className="font-medium">{students.length}</span>
                        <span className="text-gray-500">/</span>
                        <span className="font-medium">{group.capacity}</span>

                        {/* Progress bar */}
                        <div className="w-16 h-2 bg-gray-200 rounded-full ml-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${(students.length / group.capacity) > 0.9
                                    ? "bg-danger"
                                    : (students.length / group.capacity) > 0.7
                                        ? "bg-warning"
                                        : "bg-success"
                                    }`}
                                style={{ width: `${(students.length / group.capacity) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Transfer Panel (conditional) */}
            {showTransferPanel && (
                <div className="bg-indigo-50 p-4 rounded-md border border-indigo-200 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-indigo-900">Transfer Students</h3>
                            <p className="text-sm text-indigo-700">
                                Selected {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} to transfer
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                className="form-select border border-gray-300 rounded-md text-sm p-2"
                                value={targetGroupId || ""}
                                onChange={(e) => setTargetGroupId(parseInt(e.target.value) || null)}
                            >
                                <option value="">Select target group</option>
                                {otherGroupsData.map(g => (
                                    <option key={g.id} value={g.id} disabled={g.enrolledStudents >= g.capacity}>
                                        {g.groupName} - {g.day} {formatTime(g.startTime)}-{formatTime(g.endTime)} ({g.enrolledStudents}/{g.capacity})
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={handleTransferStudents}
                                disabled={!targetGroupId}
                                className={`px-4 py-2 rounded-md text-sm flex items-center gap-1 ${targetGroupId
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                <MdSwapHoriz size={16} />
                                <span>Transfer</span>
                            </button>

                            <button
                                onClick={() => {
                                    setShowTransferPanel(false);
                                    setTargetGroupId(null);
                                }}
                                className="px-4 py-2 border border-indigo-300 text-indigo-600 rounded-md text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="relative flex items-center">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <LuSearch size={20} className="text-[#0E1726]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search students..."
                        className="h-10 pl-10 pr-4 w-full md:w-[300px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    {selectedStudents.length > 0 && (
                        <button
                            onClick={() => setSelectedStudents([])}
                            className="px-3 py-2 border border-gray-300 text-gray-600 rounded-md text-sm flex items-center gap-1"
                        >
                            <BiSelectMultiple size={16} />
                            <span>Clear Selection ({selectedStudents.length})</span>
                        </button>
                    )}

                    <button
                        className="px-3 py-2 bg-secondary text-white rounded-md text-sm flex items-center gap-1"
                        onClick={() => {/* Add students functionality */ }}
                    >
                        <LuUserPlus size={16} />
                        <span>Add Students</span>
                    </button>
                </div>
            </div>

            {/* Students Table */}
            <div className="datatables">
                <DataTable
                    highlightOnHover
                    withBorder
                    className="table-hover"
                    records={filteredStudents}
                    selectedRecords={selectedStudents}
                    onSelectedRecordsChange={setSelectedStudents}
                    columns={[
                        {
                            accessor: "name",
                            title: "Student Name",
                            render: (row) => (
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-600 text-xs">
                                            {row.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{row.name}</p>
                                        <p className="text-xs text-gray-500">{row.email}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            accessor: "studentId",
                            title: "Student ID"
                        },
                        {
                            accessor: "attendanceRate",
                            title: "Attendance",
                            render: (row) => (
                                <div className="flex items-center gap-1">
                                    <span
                                        className={`${row.attendanceRate >= 90
                                            ? "text-success"
                                            : row.attendanceRate >= 75
                                                ? "text-warning"
                                                : "text-danger"
                                            } font-medium`}
                                    >
                                        {row.attendanceRate}%
                                    </span>
                                </div>
                            )
                        },
                        {
                            accessor: "grades",
                            title: "Course Progress",
                            render: (row) => (
                                <div>
                                    {row.grades.total !== null ? (
                                        <div className="flex flex-col">
                                            <span className="font-medium">{row.grades.total}%</span>
                                            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${row.grades.total >= 85
                                                        ? "bg-success"
                                                        : row.grades.total >= 70
                                                            ? "bg-primary"
                                                            : row.grades.total >= 50
                                                                ? "bg-warning"
                                                                : "bg-danger"
                                                        }`}
                                                    style={{ width: `${row.grades.total}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">No grades yet</span>
                                    )}
                                </div>
                            )
                        },
                        {
                            accessor: "actions",
                            title: "Actions",
                            render: (row) => (
                                <div className="flex items-center gap-2">
                                    <button
                                        className="px-2 py-1 bg-primary-light text-primary rounded text-xs flex items-center gap-1"
                                    >
                                        <LuUserMinus size={14} />
                                        <span>Remove</span>
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    emptyState={
                        <div className="flex flex-col items-center justify-center p-8">
                            <LuUsers size={48} className="text-gray-300 mb-2" />
                            <p className="text-gray-500 text-lg font-medium">No students found</p>
                            <p className="text-gray-400 text-sm">
                                {search ? 'Try adjusting your search term' : 'Add students to this group to get started'}
                            </p>
                            {!search && (
                                <button
                                    className="mt-4 px-4 py-2 bg-secondary text-white rounded-md text-sm flex items-center gap-1"
                                    onClick={() => {/* Add students functionality */ }}
                                >
                                    <LuUserPlus size={16} />
                                    <span>Add Students</span>
                                </button>
                            )}
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default CourseGroupDetailPage; 