import React from 'react';

const StatusBadge = ({ status }) => {
  // Function to determine the overall status
  const getOverallStatus = () => {
    const statusArray = Object.entries(status);
    
    // If all are completed
    if (statusArray.every(([_, value]) => value.completed)) {
      return {
        label: "Completed",
        color: "bg-green-100 text-green-800",
      };
    }
    
    // Find the first incomplete status
    const firstIncomplete = statusArray.find(([_, value]) => !value.completed);
    
    if (!firstIncomplete) return {
      label: "Unknown",
      color: "bg-gray-100 text-gray-800"
    };
    
    const statusColors = {
      registration: "bg-blue-100 text-blue-800",
      sampleCollection: "bg-purple-100 text-purple-800",
      testing: "bg-amber-100 text-amber-800",
      reportGeneration: "bg-emerald-100 text-emerald-800"
    };
    
    const statusLabels = {
      registration: "Registration",
      sampleCollection: "Sample Collection",
      testing: "Testing",
      reportGeneration: "Report Generation"
    };
    
    return {
      label: statusLabels[firstIncomplete[0]],
      color: statusColors[firstIncomplete[0]]
    };
  };
  
  const { label, color } = getOverallStatus();
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

export default StatusBadge;