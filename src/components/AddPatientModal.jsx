import React, { useState } from 'react';
import { FiX } from 'react-icons/fi'; // Feather Icons


const AddPatientModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'M',
    referredByDr: '',
    contactNumber: '',
    email: '',
    testType: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field when user types
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }
    
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age <= 0 || formData.age > 120) {
      newErrors.age = 'Please enter a valid age';
    }
    
    if (!formData.referredByDr.trim()) {
      newErrors.referredByDr = 'Referring doctor is required';
    }
    
    if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid 10-digit number';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://labbackend-os6o.onrender.com/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: formData.patientName,
          age: Number(formData.age),
          gender: formData.gender,
          referredByDr: formData.referredByDr,
          mobileNumber: formData.mobileNumber || undefined,
          email: formData.email || undefined,
          testType: formData.testType || undefined
        }),
      });
      
      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        setErrors({ 
          submit: errorData.message || 'Failed to add patient. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      setErrors({ 
        submit: 'Server error. Please try again later.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Register New Patient</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="patientName">
                Patient Name *
              </label>
              <input
                id="patientName"
                type="text"
                className={`block w-full rounded-md border ${errors.patientName ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
                value={formData.patientName}
                onChange={handleChange}
              />
              {errors.patientName && (
                <p className="mt-1 text-sm text-red-600">{errors.patientName}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="age">
                  Age *
                </label>
                <input
                  id="age"
                  type="number"
                  className={`block w-full rounded-md border ${errors.age ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
                  value={formData.age}
                  onChange={handleChange}
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="gender">
                  Gender *
                </label>
                <select
                  id="gender"
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="referredByDr">
                Referred By Doctor *
              </label>
              <input
                id="referredByDr"
                type="text"
                className={`block w-full rounded-md border ${errors.referredByDr ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
                value={formData.referredByDr}
                onChange={handleChange}
              />
              {errors.referredByDr && (
                <p className="mt-1 text-sm text-red-600">{errors.referredByDr}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="mobileNumber">
                Contact Number
              </label>
              <input
                id="mobileNumber"
                type="text"
                className={`block w-full rounded-md border ${errors.contactNumber ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
                value={formData.mobileNumber}
                onChange={handleChange}
              />
              {errors.contactNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className={`block w-full rounded-md border ${errors.email ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="testType">
                Test Type
              </label>
              <select
                id="testType"
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                value={formData.testType}
                onChange={handleChange}
              >
                <option value="">Select Test Type</option>
                <option value="blood">Blood Test</option>
                <option value="urine">Urine Analysis</option>
                <option value="covid">COVID-19 Test</option>
                <option value="xray">X-Ray</option>
                <option value="ultrasound">Ultrasound</option>
                <option value="other">Other</option>
              </select>
            </div> */}
            
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Register Patient'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;