import React, { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';          
import { GiTestTubes } from 'react-icons/gi';  
import PatientTable from './PatientTable';
import AddPatientModal from './AddPatientModal';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch patients
        const patientsResponse = await fetch('http://localhost:5000/api/patients');
        const patientsData = await patientsResponse.json();
        
        // Fetch reports
        const reportsResponse = await fetch('http://localhost:5000/api/reports');
        const reportsData = await reportsResponse.json();
        
        setPatients(patientsData);
        setReports(reportsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshData]);

  const handleAddSuccess = () => {
    setShowModal(false);
    setRefreshData(!refreshData);
  };

  const handleStatusUpdate = async (patientId, statusType, completed) => {
    try {
      const response = await fetch(`http://localhost:5000/api/patients/status/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statusType,
          completed
        }),
      });
      
      if (response.ok) {
        setRefreshData(!refreshData);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveReport = async (patientId, reportData, reportId = null) => {
    try {
      const url = reportId 
        ? `http://localhost:5000/api/reports/${reportId}`
        : 'http://localhost:5000/api/reports/create';
      
      const method = reportId ? 'PUT' : 'POST';
      
      const body = reportId
        ? JSON.stringify({ reportData })
        : JSON.stringify({ patientId, reportData });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body
      });

      if (!response.ok) {
        throw new Error(`Failed to ${reportId ? 'update' : 'create'} report`);
      }

      const data = await response.json();
      setRefreshData(!refreshData);
      return true;
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  };

  const handlePrintReport = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/patient/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // Here you would implement your print logic
          console.log("Printing report:", data[0]);
          // window.print() or open print dialog with report data
        }
      }
    } catch (error) {
      console.error('Error fetching report for printing:', error);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          patient.patientUID.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (patient.referredByDr && patient.referredByDr.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (filterStatus !== 'all') {
      const statusMap = {
        'registration': 'registration',
        'sampleCollection': 'sampleCollection',
        'testing': 'testing',
        'reportGeneration': 'reportGeneration',
        'completed': 'completed'
      };
      
      if (filterStatus === 'completed') {
        matchesStatus = Object.values(patient.status).every(s => s.completed);
      } else {
        matchesStatus = patient.status[statusMap[filterStatus]] && 
                       !patient.status[statusMap[filterStatus]].completed;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <GiTestTubes className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">Lab Report Management System</span>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto py-0 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">LAB Dashboard</h1>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center shadow-sm"
            >
              <FiPlus size={18} className="mr-1" />
              Register New Patient
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="w-full md:w-1/4">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="registration">Pending Registration</option>
                <option value="sampleCollection">Pending Sample Collection</option>
                <option value="testing">Pending Testing</option>
                <option value="reportGeneration">Pending Report Generation</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading patient records...</p>
            </div>
          ) : (
            <PatientTable 
              patients={filteredPatients} 
              onStatusUpdate={handleStatusUpdate}
              onSaveReport={handleSaveReport}
              onPrintReport={handlePrintReport}
            />
          )}
        </div>
      </div>

      {showModal && (
        <AddPatientModal 
          onClose={() => setShowModal(false)} 
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
