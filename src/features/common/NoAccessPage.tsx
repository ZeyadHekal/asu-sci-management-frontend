import React from 'react';
import { PiWarningCircleBold } from "react-icons/pi";

const NoAccessPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <PiWarningCircleBold size={64} className="text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">No Access</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access any pages in the system. This might be because your account hasn't been properly configured yet.
        </p>
        <p className="text-gray-600 mb-6">
          Please contact a system administrator to request the appropriate privileges for your account.
        </p>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact the IT support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoAccessPage; 