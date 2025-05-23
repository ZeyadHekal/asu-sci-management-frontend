import { useState, useEffect } from 'react';
import { GroupCalculationResult, Lab } from '../types/examTypes';
import { CourseGroupDto } from '../../../generated/types/CourseGroupDto';

interface ExamGroupCalculatorProps {
  courseId: string;
  onCalculationComplete: (result: GroupCalculationResult) => void;
}

const ExamGroupCalculator = ({ courseId, onCalculationComplete }: ExamGroupCalculatorProps) => {
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [availableLabs, setAvailableLabs] = useState<Lab[]>([]);
  const [calculationResult, setCalculationResult] = useState<GroupCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Mock data - replace with actual API calls
  const mockLabs: Lab[] = [
    {
      id: 'lab-1',
      name: 'Computer Lab A',
      capacity: 30,
      available: true,
      equipment: ['Computers', 'Projector'],
      location: 'Building A, Floor 2'
    },
    {
      id: 'lab-2', 
      name: 'Computer Lab B',
      capacity: 25,
      available: true,
      equipment: ['Computers', 'Whiteboard'],
      location: 'Building A, Floor 3'
    },
    {
      id: 'lab-3',
      name: 'Computer Lab C', 
      capacity: 35,
      available: false,
      equipment: ['Computers', 'Smart Board'],
      location: 'Building B, Floor 1'
    }
  ];

  useEffect(() => {
    // TODO: Replace with actual API call to get available labs
    setAvailableLabs(mockLabs);
    
    // TODO: Replace with actual API call to get student count for course
    setTotalStudents(85); // Mock student count
  }, [courseId]);

  const calculateGroups = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      const availableLabsOnly = availableLabs.filter(lab => lab.available);
      const totalCapacity = availableLabsOnly.reduce((sum, lab) => sum + lab.capacity, 0);
      
      if (totalCapacity === 0) {
        setCalculationResult({
          totalStudents,
          requiredGroups: 0,
          studentsPerGroup: 0,
          availableLabs: availableLabsOnly,
          recommendedAllocation: [],
          warnings: ['No available labs found. Please check lab availability.']
        });
        setIsCalculating(false);
        return;
      }

      const warnings: string[] = [];
      
      // Check if we have enough capacity
      if (totalStudents > totalCapacity) {
        warnings.push(`Not enough lab capacity. Need ${totalStudents} seats but only ${totalCapacity} available.`);
      }

      // Calculate optimal group distribution
      const recommendedAllocation = [];
      let remainingStudents = totalStudents;
      let groupCounter = 1;

      for (const lab of availableLabsOnly) {
        if (remainingStudents <= 0) break;
        
        const studentsForThisLab = Math.min(remainingStudents, lab.capacity);
        const groupsInThisLab = Math.ceil(studentsForThisLab / lab.capacity);
        
        recommendedAllocation.push({
          labId: lab.id,
          labName: lab.name,
          capacity: lab.capacity,
          assignedGroups: groupsInThisLab,
          assignedStudents: studentsForThisLab
        });
        
        remainingStudents -= studentsForThisLab;
        groupCounter += groupsInThisLab;
      }

      const result: GroupCalculationResult = {
        totalStudents,
        requiredGroups: recommendedAllocation.reduce((sum, alloc) => sum + alloc.assignedGroups, 0),
        studentsPerGroup: Math.ceil(totalStudents / recommendedAllocation.length),
        availableLabs: availableLabsOnly,
        recommendedAllocation,
        warnings
      };

      setCalculationResult(result);
      onCalculationComplete(result);
      setIsCalculating(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-secondary mb-4">
        Exam Group Calculator
      </h3>
      
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Students in Course
          </label>
          <input
            type="number"
            value={totalStudents}
            onChange={(e) => setTotalStudents(Number(e.target.value))}
            className="form-input w-full"
            placeholder="Enter number of students"
          />
        </div>
        
        <div className="flex items-end">
          <button
            onClick={calculateGroups}
            disabled={isCalculating || totalStudents <= 0}
            className="w-full px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Groups'}
          </button>
        </div>
      </div>

      {/* Available Labs */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Available Labs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableLabs.map((lab) => (
            <div
              key={lab.id}
              className={`p-3 rounded-lg border ${
                lab.available 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-sm">{lab.name}</h5>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    lab.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {lab.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                Capacity: {lab.capacity} students
              </p>
              <p className="text-xs text-gray-600">{lab.location}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Calculation Results */}
      {calculationResult && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-800 mb-4">
            Calculation Results
          </h4>
          
          {/* Warnings */}
          {calculationResult.warnings.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-medium text-yellow-800 mb-2">Warnings:</h5>
              <ul className="list-disc list-inside text-sm text-yellow-700">
                {calculationResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {calculationResult.totalStudents}
              </div>
              <div className="text-sm text-blue-800">Total Students</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {calculationResult.requiredGroups}
              </div>
              <div className="text-sm text-green-800">Required Groups</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {calculationResult.studentsPerGroup}
              </div>
              <div className="text-sm text-purple-800">Students/Group</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {calculationResult.availableLabs.length}
              </div>
              <div className="text-sm text-orange-800">Available Labs</div>
            </div>
          </div>

          {/* Recommended Allocation */}
          <div>
            <h5 className="font-medium text-gray-800 mb-3">
              Recommended Lab Allocation
            </h5>
            <div className="space-y-2">
              {calculationResult.recommendedAllocation.map((allocation, index) => (
                <div
                  key={allocation.labId}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{allocation.labName}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      (Capacity: {allocation.capacity})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {allocation.assignedStudents} students
                    </div>
                    <div className="text-sm text-gray-600">
                      {allocation.assignedGroups} group(s)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamGroupCalculator; 