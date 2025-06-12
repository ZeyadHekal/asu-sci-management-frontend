import { useParams, useNavigate } from "react-router";
import { LuArrowLeft, LuConstruction } from "react-icons/lu";

const CourseGroupDetailPage = () => {
    const navigate = useNavigate();
    const { courseId, groupId } = useParams<{ courseId: string; groupId: string }>();

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
            </div>

            {/* Coming Soon Content */}
            <div className="flex flex-col items-center justify-center py-16">
                <LuConstruction size={64} className="text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Group Details Coming Soon</h2>
                <p className="text-gray-500 text-center max-w-md">
                    The detailed group view with student management is currently under development. 
                    You can manage groups from the groups overview page for now.
                </p>
                <button
                    onClick={() => navigate(`/courses/${courseId}/groups`)}
                    className="mt-6 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
                >
                    Back to Groups Overview
                </button>
            </div>
        </div>
    );
};

export default CourseGroupDetailPage; 