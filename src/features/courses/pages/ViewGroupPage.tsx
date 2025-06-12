import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { FaArrowLeft, FaUsers, FaExchangeAlt } from "react-icons/fa";
import { LuUsers, LuMoveDiagonal } from "react-icons/lu";
import { TbAlertTriangle } from "react-icons/tb";
import { DataTable } from "mantine-datatable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../../../global/api/apiClient";
import toast from "react-hot-toast";

interface Student {
	id: string;
	name: string;
	username: string;
	seatNo: string;
}

interface GroupDetails {
	id: string;
	groupName: string;
	order: number;
	capacity: number;
	actualCapacity: number;
	isDefault: boolean;
	course: {
		id: string;
		name: string;
		subjectCode: string;
		courseNumber: string;
	};
	lab: {
		id: string;
		name: string;
		capacity: number;
	} | null;
	students: Student[];
	studentCount: number;
}

interface AvailableGroup {
	id: string;
	groupName: string;
	order: number;
	capacity: number;
	currentStudents: number;
	isDefault: boolean;
	isOverCapacity: boolean;
}

// Add interface for the mutation result
interface MoveStudentResult {
	success: boolean;
	message: string;
	warnings?: string[];
}

const ViewGroupPage = () => {
	const { courseId, groupId } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const [selectedTargetGroup, setSelectedTargetGroup] = useState<string>("");
	const [showMoveModal, setShowMoveModal] = useState(false);

	// Fetch group details
	const { data: groupData, isLoading: groupLoading, error: groupError } = useQuery({
		queryKey: ['courseGroup', groupId],
		queryFn: async () => {
			const response = await client({
				method: 'GET',
				url: `/course-groups/${groupId}/details`
			});
			return response.data as GroupDetails;
		},
		enabled: !!groupId
	});

	// Fetch available groups for moving students
	const { data: availableGroups, isLoading: groupsLoading } = useQuery({
		queryKey: ['availableGroups', groupId, selectedStudent?.id],
		queryFn: async () => {
			const response = await client({
				method: 'GET',
				url: `/course-groups/${groupId}/available-groups-for-move/${selectedStudent?.id}`
			});
			return response.data as AvailableGroup[];
		},
		enabled: !!groupId && !!selectedStudent?.id
	});

	// Move student mutation
	const moveStudentMutation = useMutation({
		mutationFn: async (data: { studentId: string; fromGroupId: string; toGroupId: string }) => {
			const response = await client({
				method: 'POST',
				url: '/course-groups/move-student',
				data
			});
			return response.data;
		},
		onSuccess: (result: MoveStudentResult) => {
			toast.success(result.message);
			if (result.warnings && result.warnings.length > 0) {
				result.warnings.forEach((warning: string) => {
					toast(`⚠️ ${warning}`, { duration: 5000 });
				});
			}
			
			// Refresh data
			queryClient.invalidateQueries({ queryKey: ['courseGroup', groupId] });
			setShowMoveModal(false);
			setSelectedStudent(null);
			setSelectedTargetGroup("");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Failed to move student');
		}
	});

	const handleMoveStudent = (student: Student) => {
		setSelectedStudent(student);
		setShowMoveModal(true);
	};

	const handleConfirmMove = () => {
		if (!selectedStudent || !selectedTargetGroup || !groupId) return;

		moveStudentMutation.mutate({
			studentId: selectedStudent.id,
			fromGroupId: groupId,
			toGroupId: selectedTargetGroup
		});
	};

	const getCapacityStatus = (current: number, max: number) => {
		if (max === 0) return { text: "No lab assigned", color: "text-gray-500" };
		if (current > max) return { text: "Over capacity", color: "text-red-600" };
		if (current === max) return { text: "At capacity", color: "text-orange-600" };
		return { text: "Available space", color: "text-green-600" };
	};

	if (groupLoading) {
		return (
			<div className="panel mt-6">
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary"></div>
				</div>
			</div>
		);
	}

	if (groupError || !groupData) {
		return (
			<div className="panel mt-6">
				<div className="flex flex-col items-center justify-center h-64">
					<div className="text-red-500 text-lg font-semibold mb-2">Group not found</div>
					<div className="text-gray-600 mb-4">The requested group could not be loaded.</div>
					<button 
						onClick={() => navigate(`/courses/${courseId}/groups`)}
						className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
					>
						Back to Groups
					</button>
				</div>
			</div>
		);
	}

	const capacityStatus = getCapacityStatus(groupData.studentCount, groupData.capacity);
	const courseCode = `${groupData.course.subjectCode}${groupData.course.courseNumber}`;

	return (
		<div className="panel mt-6">
			{/* Back Button & Header */}
			<div className="flex flex-col gap-4 mb-6">
				<button
					onClick={() => navigate(`/courses/${courseId}/groups`)}
					className="flex items-center gap-1 text-secondary hover:text-secondary-dark self-start"
				>
					<FaArrowLeft size={14} />
					<span>Back to Groups</span>
				</button>

				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-secondary">{groupData.groupName}</h1>
						<div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
							<span className="font-semibold">{courseCode} - {groupData.course.name}</span>
							{groupData.lab && (
								<>
									<span>•</span>
									<span>{groupData.lab.name}</span>
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Warning for over capacity or no lab */}
			{(groupData.studentCount > groupData.capacity && groupData.capacity > 0) && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<div className="flex items-start gap-3">
						<TbAlertTriangle className="text-red-600 mt-0.5" size={20} />
						<div className="flex-1">
							<h3 className="font-medium text-red-800 mb-1">Over Capacity</h3>
							<p className="text-sm text-red-700">
								This group has more students ({groupData.studentCount}) than its effective capacity ({groupData.capacity}). 
								This may cause resource conflicts during labs or exams.
							</p>
						</div>
					</div>
				</div>
			)}

			{!groupData.lab && !groupData.isDefault && (
				<div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
					<div className="flex items-start gap-3">
						<TbAlertTriangle className="text-orange-600 mt-0.5" size={20} />
						<div className="flex-1">
							<h3 className="font-medium text-orange-800 mb-1">No Lab Assigned</h3>
							<p className="text-sm text-orange-700">
								This group is not assigned to any lab and cannot be used for practical sessions or exams.
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Group Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				{/* Lab Assignment */}
				<div className="bg-white p-4 rounded-md border shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-full bg-gray-200 text-gray-700">
							<LuUsers size={24} />
						</div>
						<div>
							<p className="text-gray-600 text-sm">Lab Assignment</p>
							<p className="text-lg font-semibold">{groupData.lab?.name || "No Lab"}</p>
							{groupData.isDefault && (
								<p className="text-xs text-gray-500">Default Group</p>
							)}
						</div>
					</div>
				</div>

				{/* Student Count */}
				<div className="bg-white p-4 rounded-md border shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-full bg-primary-light text-primary">
							<FaUsers size={24} />
						</div>
						<div>
							<p className="text-gray-600 text-sm">Students</p>
							<p className="text-2xl font-semibold">{groupData.studentCount}</p>
						</div>
					</div>
				</div>

				{/* Capacity Status */}
				<div className="bg-white p-4 rounded-md border shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-full bg-secondary-light text-secondary">
							<FaUsers size={24} />
						</div>
						<div>
							<p className="text-gray-600 text-sm">Capacity</p>
							<p className="text-2xl font-semibold">{groupData.studentCount}/{groupData.capacity || "∞"}</p>
							<p className={`text-xs ${capacityStatus.color}`}>{capacityStatus.text}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Students Table */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold">Students ({groupData.studentCount})</h2>
				</div>

				{groupData.students.length === 0 ? (
					<div className="panel">
						<div className="flex flex-col items-center justify-center h-32">
							<FaUsers size={48} className="text-gray-400 mb-4" />
							<div className="text-gray-600 text-lg font-semibold mb-2">No Students</div>
							<div className="text-gray-500">This group has no students assigned yet.</div>
						</div>
					</div>
				) : (
					<div className="panel">
						<DataTable
							highlightOnHover
							withBorder
							className="table-hover"
							records={groupData.students}
							columns={[
								{
									accessor: "name",
									title: "Student",
									render: (row) => (
										<div className="flex items-center gap-2">
											<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
												<span className="text-gray-600 text-xs">
													{row.name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</span>
											</div>
											<div>
												<p className="font-medium">{row.name}</p>
												<p className="text-xs text-gray-500">{row.username}</p>
											</div>
										</div>
									),
								},
								{
									accessor: "seatNo",
									title: "Seat No",
									width: 100,
								},
								{
									accessor: "actions",
									title: "Actions",
									width: 120,
									render: (row) => (
										<button
											onClick={() => handleMoveStudent(row)}
											className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-white rounded hover:bg-secondary-dark"
											disabled={moveStudentMutation.isPending}
										>
											<LuMoveDiagonal size={12} />
											Move
										</button>
									),
								},
							]}
						/>
					</div>
				)}
			</div>

			{/* Move Student Modal */}
			{showMoveModal && selectedStudent && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
						<h3 className="text-lg font-semibold mb-4">Move Student</h3>
						
						<div className="mb-4">
							<p className="text-sm text-gray-600 mb-2">
								Moving: <span className="font-medium">{selectedStudent.name}</span>
							</p>
							<p className="text-sm text-gray-600 mb-4">
								From: <span className="font-medium">{groupData.groupName}</span>
							</p>
						</div>

						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Select Target Group:
							</label>
							<select
								value={selectedTargetGroup}
								onChange={(e) => setSelectedTargetGroup(e.target.value)}
								className="form-select w-full"
								disabled={groupsLoading}
							>
								<option value="">Choose a group...</option>
								{availableGroups?.map((group) => (
									<option key={group.id} value={group.id}>
										{group.groupName} ({group.currentStudents}/{group.capacity || "∞"})
										{group.isOverCapacity && " - Over capacity"}
									</option>
								))}
							</select>
						</div>

						{selectedTargetGroup && availableGroups && (
							<div className="mb-4">
								{(() => {
									const targetGroup = availableGroups.find(g => g.id === selectedTargetGroup);
									if (!targetGroup) return null;
									
									const warnings = [];
									if (targetGroup.isOverCapacity) {
										warnings.push("Target group is over capacity");
									}
									if (targetGroup.isDefault) {
										warnings.push("Moving to default group (no lab assigned)");
									}
									
									if (warnings.length > 0) {
										return (
											<div className="p-3 bg-orange-50 border border-orange-200 rounded">
												<div className="flex items-start gap-2">
													<TbAlertTriangle className="text-orange-600 mt-0.5" size={16} />
													<div className="text-sm text-orange-700">
														{warnings.map((warning, index) => (
															<div key={index}>• {warning}</div>
														))}
													</div>
												</div>
											</div>
										);
									}
									return null;
								})()}
							</div>
						)}

						<div className="flex gap-2 justify-end">
							<button
								onClick={() => {
									setShowMoveModal(false);
									setSelectedStudent(null);
									setSelectedTargetGroup("");
								}}
								className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
								disabled={moveStudentMutation.isPending}
							>
								Cancel
							</button>
							<button
								onClick={handleConfirmMove}
								disabled={!selectedTargetGroup || moveStudentMutation.isPending}
								className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-dark disabled:opacity-50"
							>
								{moveStudentMutation.isPending ? 'Moving...' : 'Move Student'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ViewGroupPage; 