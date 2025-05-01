import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import fairLogo from '/logo.png'; 

const PrintReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patient, reportData } = location.state || {};
  
  // If no data is passed, show error
  if (!patient || !reportData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-red-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-700 mb-4">No Report Data Available</h2>
          <p className="text-gray-700 mb-6">Unable to display report. Please go back and try again.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Handle print action
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white">
      {/* Print/Back buttons - hidden during print */}
      <div className="flex justify-between mb-6 print:hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back
        </button>
        <button 
          onClick={handlePrint} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Print Report
        </button>
      </div>
      
      {/* Report Content - this will be printed */}
      <div className="border border-gray-300 p-4 print:p-1">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-300 pb-4">
          <div className="flex items-center space-x-2">
            <img src={fairLogo} alt="Fair Diagnostic LLP" className="h-16" />
            <div>
              <h1 className="text-xl font-bold text-blue-700">Fair Diagnostic LLP</h1>
              <p className="text-sm text-blue-600">FAIR PRICE FOR ALL</p>
            </div>
          </div>
          <div className="flex space-x-8">
            <div>
              <img src="/NABL.png" alt="NABL Logo" className="h-12" />
            </div>
            <div>
              <img src="/ISO.png" alt="ISO Logo" className="h-12" />
            </div>
          </div>
        </div>
        
        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-2 py-2 border-b border-gray-300">
          <div className="grid grid-cols-3 gap-1">
            <div className="font-semibold text-sm">Visit No.</div>
            <div className="col-span-2 text-sm">: {patient.visitNo || '-'}</div>
            
            <div className="font-semibold text-sm">Patient Name</div>
            <div className="col-span-2 text-sm">: {patient.patientName || '-'}</div>
            
            <div className="font-semibold text-sm">Age / Gender</div>
            <div className="col-span-2 text-sm">: {patient.age || '-'} / {patient.gender === 'M' ? 'M' : patient.gender === 'F' ? 'F' : '-'}</div>
            
            <div className="font-semibold text-sm">Referred By Dr.</div>
            <div className="col-span-2 text-sm">: {patient.referredByDr || '-'}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-1">
            <div className="font-semibold text-sm">Patient UID</div>
            <div className="col-span-2 text-sm">: {patient.patientUID || '-'}</div>
            
            <div className="font-semibold text-sm">Registration Date</div>
            <div className="col-span-2 text-sm">: {formatDate(patient.registrationDate)}</div>
            
            <div className="font-semibold text-sm">Sample Receive on</div>
            <div className="col-span-2 text-sm">: {formatDate(patient.sampleReceiveDate)}</div>
            
            <div className="font-semibold text-sm">Report Released on</div>
            <div className="col-span-2 text-sm">: {formatDate(patient.reportReleasedDate)}</div>
          </div>
        </div>
        
        {/* Report Title */}
        <div className="text-center py-2 border-b border-gray-300 bg-gray-100">
          <h2 className="font-bold">Haematology Report</h2>
        </div>
        
        {/* Report Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1 text-left text-sm w-1/3">TEST DESCRIPTION</th>
              <th className="border border-gray-300 px-2 py-1 text-center text-sm w-1/6">RESULT</th>
              <th className="border border-gray-300 px-2 py-1 text-center text-sm w-1/6">UNITS</th>
              <th className="border border-gray-300 px-2 py-1 text-center text-sm w-1/3">BIOLOGICAL REFERENCE RANGES</th>
            </tr>
          </thead>
          <tbody>
            {/* COMPLETE BLOOD COUNT WITH ESR */}
            <tr>
              <td colSpan="4" className="border border-gray-300 px-2 py-1 font-bold">COMPLETE BLOOD COUNT WITH ESR</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                HAEMOGLOBIN
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.haemoglobin?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">gm/dL</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.haemoglobin?.reference || '12.0 - 15.0'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                RBC Count
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.rbcCount?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">mil/cu.mm</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.rbcCount?.reference || '4.5 - 5.5'}
              </td>
            </tr>
            
            {/* RBC INDICES */}
            <tr>
              <td colSpan="4" className="border border-gray-300 px-2 py-1 font-bold">RBC INDICES</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Hematocrit, HCT (PCV)
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.rbcIndices?.hematocrit?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">%</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.rbcIndices?.hematocrit?.reference || '40 - 50'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Mean Corp Volume MCV
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.rbcIndices?.mcv?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">fl</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.rbcIndices?.mcv?.reference || '83 - 101'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Mean Corp Hb MCH
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.rbcIndices?.mch?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">pg</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.rbcIndices?.mch?.reference || '27 - 32'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Mean Corp Hb Conc MCHC
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.rbcIndices?.mchc?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">gm/dL</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.rbcIndices?.mchc?.reference || '31 - 34.5'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                RDW - CV
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.rbcIndices?.rdw?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">%</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.rbcIndices?.rdw?.reference || '11 - 16'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Total WBC Count
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.totalWBCCount?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">cell/cu.mm</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.totalWBCCount?.reference || '4000 - 11000'}
              </td>
            </tr>
            
            {/* Absolute Differential Count */}
            <tr>
              <td colSpan="4" className="border border-gray-300 px-2 py-1 font-bold">Absolute Differential Count</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Absolute Neutrophil Count
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.absoluteDifferentialCount?.neutrophil?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">/cumm</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.absoluteDifferentialCount?.neutrophil?.reference || '2000 - 7000'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Absolute Lymphocyte Count
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.absoluteDifferentialCount?.lymphocyte?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">/cumm</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.absoluteDifferentialCount?.lymphocyte?.reference || '1000 - 3000'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Absolute Monocyte Count
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.absoluteDifferentialCount?.monocyte?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">/cumm</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.absoluteDifferentialCount?.monocyte?.reference || '200 - 1000'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Absolute Eosinophil Count
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.absoluteDifferentialCount?.eosinophil?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">/cumm</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.absoluteDifferentialCount?.eosinophil?.reference || '40 - 440'}
              </td>
            </tr>
            
            {/* DIFFERENTIAL COUNT */}
            <tr>
              <td colSpan="4" className="border border-gray-300 px-2 py-1 font-bold">DIFFERENTIAL COUNT</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Neutrophil
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.differentialCount?.neutrophil?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">%</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.differentialCount?.neutrophil?.reference || '40 - 75'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Lymphocyte
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.differentialCount?.lymphocyte?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">%</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.differentialCount?.lymphocyte?.reference || '15 - 45'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Monocyte
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.differentialCount?.monocyte?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">%</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.differentialCount?.monocyte?.reference || '02 - 08'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Eosinophils
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.differentialCount?.eosinophils?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">%</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.differentialCount?.eosinophils?.reference || '01 - 06'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Basophil
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.differentialCount?.basophil?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">%</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.differentialCount?.basophil?.reference || '1 - 2'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Platelet Count
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.plateletCount?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">lac/cmm</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.plateletCount?.reference || '1.5 - 4.5'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                RBC Morphology
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm" colSpan="3">
                {reportData[0]?.morphology?.rbcMorphology?.test || 'No Abnormal Cells are Seen.'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                Platelet On Smear
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm" colSpan="3">
                {reportData[0]?.morphology?.plateletSmear?.test || 'Adequate'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-2 py-1 text-sm pl-4">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                ESR
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.esr?.test || '-'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">mm/hr</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                {reportData[0]?.esr?.reference || '0 - 20'}
              </td>
            </tr>
          </tbody>
        </table>
        
        {/* End of Report */}
        <div className="text-center text-sm py-2 border-t border-gray-300 mt-2">
          ---------------------------- End of Report ----------------------------
        </div>
        
        {/* Signatures */}
        <div className="flex justify-between mt-10 px-4">
          <div className="text-center">
            <div className="h-12 border-b border-black">
              {/* Signature image would go here */}
            </div>
            <p className="text-sm mt-1">Dr. ANANDA SAMANTA</p>
            <p className="text-xs">MSc(PCH), PhD(Cal), FIC(IND)</p>
            <p className="text-xs">Consultant Biochemist</p>
            <p className="text-xs">Reg.No.:1859(Phi/D/Sc)</p>
          </div>
          
          <div className="text-center">
            <div className="h-12 border-b border-black">
              {/* Signature image would go here */}
            </div>
            <p className="text-sm mt-1">Dr. Sudeshna Ganguly (Nandi)</p>
            <p className="text-xs">DGO, MD</p>
            <p className="text-xs">-</p>
            <p className="text-xs">Reg.No.:57117(WBMC)</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-2 border-t border-gray-300 text-xs text-gray-700">
          <p className="text-center mb-1">
            <strong>Note:</strong> (In case of any doubt please contact Laboratory immediately for reporting, sampling and re-testing)
            <br />Laboratory investigations are only a tool to facilitate in arriving at a diagnosis and should be clinically correlated by a referring Medical Practitioner
          </p>
          <div className="bg-blue-100 p-2 mt-2 flex justify-center text-center">
            <p>
              9836 10214 / 73750 94540 • www.fairdiagnostic.com • CIN, CSC, DGO, MBBS (Kolkata-700 026, West Bengal, India) 
              <br />fair.diagnosticllp@gmail.com • Collection Center: Greenbind Apartment, Phase-2, 70/1, B.L. Ghosh Road, Kolkata-700 037
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintReport;