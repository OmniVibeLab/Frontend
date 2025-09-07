import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmation = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <AlertTriangle size={24} className="text-red-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">
              {title || "Confirm Delete"}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          {message || "Are you sure you want to delete this item? This action cannot be undone."}
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;