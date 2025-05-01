import React, { useState } from 'react';
import { GiTestTubes } from 'react-icons/gi';
import { FiClipboard, FiFileText, FiUserCheck, FiChevronDown, FiChevronUp, FiPhone, FiArrowRight, FiPrinter, FiEdit2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import StatusBadge from './StatusBadge';
import ReportModal from './ReportModal';

const PatientTable = ({ patients, onStatusUpdate, onSaveReport }) => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [expandedRows, setExpandedRows] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [existingReport, setExistingReport] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statusIcons = {
    registration: <FiUserCheck className="h-4 w-4 text-blue-500" />,
    sampleCollection: <GiTestTubes className="h-4 w-4 text-purple-500" />,
    testing: <FiClipboard className="h-4 w-4 text-amber-500" />,
    reportGeneration: <FiFileText className="h-4 w-4 text-green-500" />
  };

  const statusLabels = {
    registration: "Registration",
    sampleCollection: "Sample Collection",
    testing: "Testing",
    reportGeneration: "Report Generation"
  };

  const statusOrder = ['registration', 'sampleCollection', 'testing', 'reportGeneration'];

  const getNextStatus = (currentStatus) => {
    const currentIndex = statusOrder.findIndex(status => status === currentStatus);
    return currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;
  };

  const canUpdateStatus = (statusObj, statusKey) => {
    const keyIndex = statusOrder.indexOf(statusKey);
    if (keyIndex === 0) return !statusObj[statusKey].completed;
    const prevStatusKey = statusOrder[keyIndex - 1];
    return statusObj[prevStatusKey]?.completed === true && !statusObj[statusKey].completed;
  };

  const handleStatusUpdate = (patientId, statusKey, event) => {
    if (event) event.stopPropagation();
    if (canUpdateStatus(patients.find(p => p._id === patientId).status, statusKey)) {
      onStatusUpdate(patientId, statusKey, true);
    }
  };

  const toggleRowExpand = (patientId) => {
    setExpandedRows(prev => ({
      ...prev,
      [patientId]: !prev[patientId]
    }));
  };

  const handleCreateReport = async (patient) => {
    try {
      setSelectedPatient(patient);
      
      // Check for existing report
      const response = await fetch(`https://labbackend-os6o.onrender.com/api/reports/patient/${patient._id}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setExistingReport(data[0]);
        } else {
          setExistingReport(null);
        }
      }
      
      setShowReportModal(true);
    } catch (err) {
      console.error("Error checking for existing report:", err);
      setExistingReport(null);
      setShowReportModal(true);
    }
  };

  const handleSaveReport = async (reportData) => {
    try {
      let result;
      if (existingReport) {
        // Update existing report
        result = await onSaveReport(selectedPatient._id, reportData, existingReport._id);
      } else {
        // Create new report
        result = await onSaveReport(selectedPatient._id, reportData);
      }
      
      if (result) {
        setShowReportModal(false);
        setExistingReport(null);
        setSelectedPatient(null);
      }
    } catch (error) {
      console.error("Error saving report:", error);
      throw error;
    }
  };

  const handlePrintReport = async (patient) => {
    try {
      // Fetch the report data for this patient
      const response = await fetch(`https://labbackend-os6o.onrender.com/api/reports/patient/${patient._id}`);
      if (response.ok) {
        const reportData = await response.json();
        
        // Navigate to print report page with data
        if (reportData && reportData.length > 0) {
          navigate('/print-report', { state: { patient, reportData } });
        } else {
          alert("No report data found for this patient. Please create a report first.");
        }
      } else {
        alert("Error fetching report data. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching report data for printing:", error);
      alert("Error fetching report data. Please try again.");
    }
  };

  const EmptyState = () => (
    <tr>
      <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
        <div className="flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg font-medium">No patients found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      </td>
    </tr>
  );

  const MobilePatientRow = ({ patient }) => {
    const isExpanded = expandedRows[patient._id] || false;
    
    return (
      <>
        <tr 
          className="border-b cursor-pointer hover:bg-gray-50" 
          onClick={() => toggleRowExpand(patient._id)}
        >
          <td className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-blue-700">{patient.patientUID}</div>
                <div className="text-gray-900">{patient.patientName}</div>
                <div className="flex items-center text-gray-500 text-xs mt-1">
                  <FiPhone className="h-3 w-3 mr-1" />
                  {patient.mobileNumber || 'No mobile number'}
                </div>
                <StatusBadge status={patient.status} />
              </div>
              <div className="flex space-x-2">
                {patient.status.reportGeneration.completed && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintReport(patient);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Print Report"
                  >
                    <FiPrinter className="h-4 w-4" />
                  </button>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateReport(patient);
                  }}
                  className="p-1 text-green-600 hover:text-green-800"
                  title="Create/Edit Report"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <div>
                  {isExpanded ? 
                    <FiChevronUp className="h-5 w-5 text-gray-500" /> : 
                    <FiChevronDown className="h-5 w-5 text-gray-500" />
                  }
                </div>
              </div>
            </div>
          </td>
        </tr>
        {isExpanded && (
          <tr className="bg-gray-50">
            <td className="p-4">
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <div className="text-gray-500 font-medium">Age/Gender</div>
                  <div>{patient.age} / {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium">Referring Doctor</div>
                  <div>{patient.referredByDr || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium">Date</div>
                  <div>{formatDate(patient.registrationDate)}</div>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="text-gray-500 font-medium mb-2">Workflow</div>
                <div className="space-y-2">
                  {statusOrder.map((statusKey, index) => {
                    const status = patient.status[statusKey];
                    const canUpdate = canUpdateStatus(patient.status, statusKey);
                    let buttonState = "disabled";
                    if (status.completed) {
                      buttonState = "completed";
                    } else if (canUpdate) {
                      buttonState = "canUpdate";
                    }
                    
                    return (
                    <div key={statusKey} className="flex items-center">
                      {buttonState === "completed" ? (
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : buttonState === "canUpdate" ? (
                        <button 
                          onClick={(e) => handleStatusUpdate(patient._id, statusKey, e)}
                          className="h-8 w-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600 focus:outline-none"
                        >
                          <FiArrowRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <FiArrowRight className="h-4 w-4" />
                        </div>
                      )}
                      <label 
                        className={`ml-2 flex items-center text-sm ${
                          buttonState === "completed" ? 'text-gray-400' : 
                          buttonState === "canUpdate" ? 'text-gray-700' : 
                          'text-gray-400'
                        }`}
                      >
                        <span className="mr-1">{statusIcons[statusKey]}</span>
                        {statusLabels[statusKey]}
                        {status.completed && (
                          <span className="ml-1 text-xs text-gray-400">(permanent)</span>
                        )}
                      </label>
                    </div>
                  )})}
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  return (
    <div className="w-full">
      {/* Report Modal */}
      {showReportModal && selectedPatient && (
        <ReportModal
          patient={selectedPatient}
          existingReport={existingReport}
          onClose={() => {
            setShowReportModal(false);
            setExistingReport(null);
            setSelectedPatient(null);
          }}
          onSave={handleSaveReport}
        />
      )}

      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.length === 0 ? (
              <EmptyState />
            ) : (
              patients.map((patient) => (
                <tr key={patient._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-700">{patient.patientUID}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{patient.patientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{patient.age} / {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 flex items-center">
                      <FiPhone className="h-4 w-4 mr-1 text-gray-400" />
                      {patient.mobileNumber || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{patient.referredByDr || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(patient.registrationDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={patient.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      {statusOrder.map((statusKey, index) => {
                        const status = patient.status[statusKey];
                        const canUpdate = canUpdateStatus(patient.status, statusKey);
                        return (
                          <div key={statusKey} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={status.completed}
                              onChange={() => canUpdate ? onStatusUpdate(patient._id, statusKey, true) : null}
                              disabled={status.completed || !canUpdate}
                              className={`h-4 w-4 focus:ring-blue-500 border-gray-300 rounded ${
                                status.completed || !canUpdate ? 'opacity-50 cursor-not-allowed' : 'text-blue-600 cursor-pointer'
                              }`}
                              id={`${patient._id}-${statusKey}`}
                            />
                            <label 
                              htmlFor={`${patient._id}-${statusKey}`}
                              className={`ml-2 flex items-center text-xs ${
                                status.completed ? 'text-gray-400' : 
                                !canUpdate ? 'text-gray-400' : 'text-gray-700'
                              }`}
                            >
                              <span className="mr-1">{statusIcons[statusKey]}</span>
                              {statusLabels[statusKey]}
                              {status.completed && (
                                <span className="ml-1 text-xs text-gray-400">(permanent)</span>
                              )}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {patient.status.reportGeneration.completed && (
                        <button 
                          onClick={() => handlePrintReport(patient)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Print Report"
                        >
                          <FiPrinter className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleCreateReport(patient)}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Create/Edit Report"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full">
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-lg font-medium">No patients found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <MobilePatientRow key={patient._id} patient={patient} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientTable;