import { useState } from 'react';
import { toast } from 'react-hot-toast';
import client from '../../../global/api/apiClient';

interface FileSubmissionProps {
  scheduleId: string;
  disabled?: boolean;
}

interface SubmissionResponse {
  message: string;
  submittedFiles: string[];
  submittedAt: string;
}

export const FileSubmission = ({ scheduleId, disabled = false }: FileSubmissionProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }
    setFiles(selectedFiles);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await client<SubmissionResponse>({
        method: 'POST',
        url: `/events/student/${scheduleId}/submit-files`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitted(true);
      toast.success('Files submitted successfully!');
      console.log('Submission response:', response.data);
    } catch (error: any) {
      console.error('Submission failed:', error);
      
      // Handle specific error cases as mentioned in documentation
      if (error.response?.status === 404 && error.response.data?.message?.includes('not enrolled')) {
        toast.error('You are not enrolled in this exam');
      } else if (error.response?.status === 400 && error.response.data?.message?.includes('not active')) {
        toast.error('Exam is not currently accepting submissions');
      } else {
        toast.error('Failed to submit files. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Submit Your Files</h3>
        {submitted && (
          <div className="flex items-center gap-2 text-green-600">
            <span className="text-sm">✅ Submitted</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Files (Maximum 10 files)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt,.zip,.jpg,.png"
            disabled={uploading || disabled}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark disabled:opacity-50"
          />
          <p className="mt-2 text-xs text-gray-500">
            Accepted formats: PDF, DOCX, TXT, ZIP, JPG, PNG
          </p>
        </div>
        
        {files.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Files:</h4>
            <ul className="space-y-1">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{file.name}</span>
                  <span className="text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={files.length === 0 || uploading || disabled}
          className="w-full bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </div>
          ) : (
            'Submit Files'
          )}
        </button>
        
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm text-green-800 font-medium">
                Files submitted successfully!
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Your files have been uploaded and can be replaced until the exam ends.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 