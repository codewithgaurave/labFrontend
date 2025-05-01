import React, { useState, useEffect } from "react";
import { FiX, FiCheckCircle, FiAlertCircle, FiPrinter } from "react-icons/fi";

const ReportModal = ({ patient, onClose, onSaveSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [existingReport, setExistingReport] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  // Initial empty report state based on the schema
  const initialReportState = {
    haemoglobin: { test: null },
    rbcCount: { test: null },
    rbcIndices: {
      hematocrit: { test: null },
      mcv: { test: null },
      mch: { test: null },
      mchc: { test: null },
      rdw: { test: null },
    },
    totalWBCCount: { test: null },
    absoluteDifferentialCount: {
      neutrophil: { test: null },
      lymphocyte: { test: null },
      monocyte: { test: null },
      eosinophil: { test: null },
    },
    differentialCount: {
      neutrophil: { test: null },
      lymphocyte: { test: null },
      monocyte: { test: null },
      eosinophils: { test: null },
      basophil: { test: null },
    },
    plateletCount: { test: null },
    morphology: {
      rbcMorphology: { test: "" },
      wbcMorphology: { test: "" },
      plateletSmear: { test: "" },
    },
    esr: { test: null },
  };

  const [reportData, setReportData] = useState(initialReportState);

  // Fetch existing report for this patient if available
  useEffect(() => {
    const fetchExistingReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/reports/patient/${patient._id}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Use the most recent report
            const latestReport = data[0];
            setExistingReport(latestReport);
            setReportData(latestReport);
          }
        }
      } catch (err) {
        console.error("Error fetching existing report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingReport();
  }, [patient._id]);

  useEffect(() => {
    if (existingReport) {
      setReportData(existingReport);
    } else {
      setReportData(initialReportState);
    }
  }, [existingReport]);

  const handleInputChange = (section, field, value) => {
    if (section === "top-level") {
      setReportData((prev) => ({
        ...prev,
        [field]: { ...prev[field], test: value },
      }));
    } else if (section === "rbcIndices") {
      setReportData((prev) => ({
        ...prev,
        rbcIndices: {
          ...prev.rbcIndices,
          [field]: { ...prev.rbcIndices[field], test: value },
        },
      }));
    } else if (section === "absoluteDifferentialCount") {
      setReportData((prev) => ({
        ...prev,
        absoluteDifferentialCount: {
          ...prev.absoluteDifferentialCount,
          [field]: { ...prev.absoluteDifferentialCount[field], test: value },
        },
      }));
    } else if (section === "differentialCount") {
      setReportData((prev) => ({
        ...prev,
        differentialCount: {
          ...prev.differentialCount,
          [field]: { ...prev.differentialCount[field], test: value },
        },
      }));
    } else if (section === "morphology") {
      setReportData((prev) => ({
        ...prev,
        morphology: {
          ...prev.morphology,
          [field]: { ...prev.morphology[field], test: value },
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = existingReport
        ? `http://localhost:5000/api/reports/${existingReport._id}`
        : "http://localhost:5000/api/reports/create";

      const method = existingReport ? "PUT" : "POST";

      const body = existingReport
        ? JSON.stringify({ reportData })
        : JSON.stringify({ patientId: patient._id, reportData });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${existingReport ? "update" : "create"} report`
        );
      }

      const data = await response.json();
      setSuccess(true);
      
      // Call onSaveSuccess if it exists
      if (typeof onSaveSuccess === 'function') {
        onSaveSuccess(data.report);
      }

      // Auto-close the modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to save report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleViewMode = () => {
    setViewMode(!viewMode);
  };

  const isAbnormal = (value, min, max) => {
    if (value === null || value === undefined || value === "") return false;
    return value < min || value > max;
  };

  const renderTableRow = (
    label,
    value,
    unit,
    reference,
    section,
    field,
    isTextArea = false
  ) => {
    let min = 0,
      max = 0;
    if (reference) {
      [min, max] = reference.split(" - ").map(Number);
    }
    const abnormal = isAbnormal(value, min, max);

    if (viewMode) {
      return (
        <tr className={abnormal ? "bg-red-50" : ""}>
          <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium text-gray-900">
            {label}
          </td>
          <td
            className={`py-2 px-4 border-b border-gray-200 text-sm font-medium ${
              abnormal ? "text-red-600" : "text-gray-900"
            }`}
          >
            {value ?? ""}
          </td>
          <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-600">
            {unit}
          </td>
          <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-600">
            {reference}
          </td>
        </tr>
      );
    }

    return (
      <tr className={abnormal ? "bg-red-50" : ""}>
        <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium text-gray-900">
          {label}
        </td>
        <td className="py-2 px-4 border-b border-gray-200">
          {isTextArea ? (
            <textarea
              rows={2}
              className="w-full border border-gray-300 rounded p-1 text-sm"
              value={value || ""}
              onChange={(e) =>
                handleInputChange(section, field, e.target.value)
              }
            />
          ) : (
            <input
              type={typeof value === "number" ? "number" : "text"}
              step="0.01"
              className={`w-full border border-gray-300 rounded p-1 text-sm ${
                abnormal ? "text-red-600 font-bold" : ""
              }`}
              value={value ?? ""}
              onChange={(e) =>
                handleInputChange(
                  section,
                  field,
                  typeof value === "number"
                    ? e.target.value === ""
                      ? null
                      : Number(e.target.value)
                    : e.target.value
                )
              }
            />
          )}
        </td>
        <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-600">
          {unit}
        </td>
        <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-600">
          {reference}
        </td>
      </tr>
    );
  };

  // Header with logo and certification
  const renderHeader = () => (
    <div className="mb-4 print:mb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-3xl font-bold">F</span>
          </div>
          <div className="ml-2">
            <h1 className="text-xl font-bold text-blue-600">
              Fair Diagnostic LLP
            </h1>
            <p className="text-sm text-blue-500">FAIR PRICE FOR ALL</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
            <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Patient info section
  const renderPatientInfo = () => {
    const today = new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, ".");

    return (
      <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-200 py-3 print:text-xs">
        {/* Left column */}
        <div className="space-y-1">
          <div className="flex">
            <div className="font-medium w-40">Visit No.</div>
            <div>: {patient.patientUID || "BL/094/24-25"}</div>
          </div>
          <div className="flex">
            <div className="font-medium w-40">Patient Name</div>
            <div>: {patient.patientName}</div>
          </div>
          <div className="flex">
            <div className="font-medium w-40">Age / Gender</div>
            <div>
              : {patient.age} /{" "}
              {patient.gender === "M"
                ? "M"
                : patient.gender === "F"
                ? "F"
                : "Other"}
            </div>
          </div>
          <div className="flex">
            <div className="font-medium w-40">Referred By Dr.</div>
            <div>: {patient.referredByDr || "Dr. ANIRBAN DAS"}</div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-1">
          <div className="flex">
            <div className="font-medium w-40">Patient UID</div>
            <div>: {patient.patientUID || "FD9522"}</div>
          </div>
          <div className="flex">
            <div className="font-medium w-40">Registration Date</div>
            <div>: {today}</div>
          </div>
          <div className="flex">
            <div className="font-medium w-40">Sample Receive on</div>
            <div>: {today}</div>
          </div>
          <div className="flex">
            <div className="font-medium w-40">Report Released on</div>
            <div>: {today}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:max-h-full print:shadow-none print:rounded-none print:w-full print:m-0 print:p-0">
        <div className="p-4 sm:p-6 sticky top-0 bg-white z-10 print:static print:p-2">
          <div className="flex justify-between items-center print:hidden">
            <h2 className="text-lg font-medium text-gray-900">
              {viewMode ? "View Haematology Report" : "Edit Haematology Report"}
            </h2>
            <div className="flex gap-2">
              {existingReport && (
                <button
                  onClick={toggleViewMode}
                  className="py-2 px-3 rounded-md bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200"
                >
                  {viewMode ? "Edit Report" : "View Report"}
                </button>
              )}
              {viewMode && (
                <button
                  onClick={handlePrint}
                  className="py-2 px-3 rounded-md bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 flex items-center"
                >
                  <FiPrinter className="mr-1" /> Print
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 print:px-2">
          {renderHeader()}
          {renderPatientInfo()}

          <div className="text-center font-bold my-2 print:my-1">
            <h3 className="text-lg print:text-base">Haemological Report</h3>
          </div>

          {/* Status messages - hide on print */}
          <div className="print:hidden">
            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiCheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Report {existingReport ? "updated" : "created"} successfully. 
                      This window will close automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="print:text-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TEST DESCRIPTION
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RESULT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UNITS
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BIOLOGICAL REFERENCE RANGES
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-2 font-medium bg-gray-100"
                    >
                      COMPLETE BLOOD COUNT WITH ESR
                    </td>
                  </tr>

                  {/* Basic Blood Parameters */}
                  {renderTableRow(
                    "HAEMOGLOBIN",
                    reportData.haemoglobin.test,
                    "gm/dL",
                    "12.0 - 15.0",
                    "top-level",
                    "haemoglobin"
                  )}
                  {renderTableRow(
                    "RBC Count",
                    reportData.rbcCount.test,
                    "mil/cu.mm",
                    "4.5 - 5.5",
                    "top-level",
                    "rbcCount"
                  )}

                  {/* RBC Indices */}
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-2 font-medium bg-gray-100"
                    >
                      RBC INDICES
                    </td>
                  </tr>
                  {renderTableRow(
                    "Hematocrit HCT (PCV)",
                    reportData.rbcIndices.hematocrit.test,
                    "%",
                    "40 - 50",
                    "rbcIndices",
                    "hematocrit"
                  )}
                  {renderTableRow(
                    "Mean Corp Volume MCV",
                    reportData.rbcIndices.mcv.test,
                    "fl",
                    "83 - 101",
                    "rbcIndices",
                    "mcv"
                  )}
                  {renderTableRow(
                    "Mean Corp Hb MCH",
                    reportData.rbcIndices.mch.test,
                    "pg",
                    "27 - 32",
                    "rbcIndices",
                    "mch"
                  )}
                  {renderTableRow(
                    "Mean Corp Hb Conc MCHC",
                    reportData.rbcIndices.mchc.test,
                    "gm/dL",
                    "31 - 34.5",
                    "rbcIndices",
                    "mchc"
                  )}
                  {renderTableRow(
                    "RDW - CV",
                    reportData.rbcIndices.rdw.test,
                    "%",
                    "11 - 16",
                    "rbcIndices",
                    "rdw"
                  )}

                  {/* WBC Count */}
                  {renderTableRow(
                    "Total WBC Count",
                    reportData.totalWBCCount.test,
                    "cell/cu.mm",
                    "4000 - 11000",
                    "top-level",
                    "totalWBCCount"
                  )}

                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-2 font-medium bg-gray-100"
                    >
                      Absolute Differential Count
                    </td>
                  </tr>
                  {renderTableRow(
                    "Absolute Neutrophil Count",
                    reportData.absoluteDifferentialCount.neutrophil.test,
                    "/cumm",
                    "2000 - 7000",
                    "absoluteDifferentialCount",
                    "neutrophil"
                  )}
                  {renderTableRow(
                    "Absolute Lymphocyte Count",
                    reportData.absoluteDifferentialCount.lymphocyte.test,
                    "/cumm",
                    "1000 - 3000",
                    "absoluteDifferentialCount",
                    "lymphocyte"
                  )}
                  {renderTableRow(
                    "Absolute Monocyte Count",
                    reportData.absoluteDifferentialCount.monocyte.test,
                    "/cumm",
                    "200 - 1000",
                    "absoluteDifferentialCount",
                    "monocyte"
                  )}
                  {renderTableRow(
                    "Absolute Eosinophil Count",
                    reportData.absoluteDifferentialCount.eosinophil.test,
                    "/cumm",
                    "40 - 440",
                    "absoluteDifferentialCount",
                    "eosinophil"
                  )}

                  {/* Differential Count */}
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-2 font-medium bg-gray-100"
                    >
                      DIFFERENTIAL COUNT
                    </td>
                  </tr>
                  {renderTableRow(
                    "Neutrophil",
                    reportData.differentialCount.neutrophil.test,
                    "%",
                    "40 - 75",
                    "differentialCount",
                    "neutrophil"
                  )}
                  {renderTableRow(
                    "Lymphocyte",
                    reportData.differentialCount.lymphocyte.test,
                    "%",
                    "15 - 45",
                    "differentialCount",
                    "lymphocyte"
                  )}
                  {renderTableRow(
                    "Monocyte",
                    reportData.differentialCount.monocyte.test,
                    "%",
                    "02 - 08",
                    "differentialCount",
                    "monocyte"
                  )}
                  {renderTableRow(
                    "Eosinophils",
                    reportData.differentialCount.eosinophils.test,
                    "%",
                    "01 - 06",
                    "differentialCount",
                    "eosinophils"
                  )}
                  {renderTableRow(
                    "Basophil",
                    reportData.differentialCount.basophil.test,
                    "%",
                    "1 - 2",
                    "differentialCount",
                    "basophil"
                  )}

                  {/* Platelet Count */}
                  {renderTableRow(
                    "Platelet Count",
                    reportData.plateletCount.test,
                    "lac/cmm",
                    "1.5 - 4.5",
                    "top-level",
                    "plateletCount"
                  )}

                  {/* Morphology */}
                  {renderTableRow(
                    "RBC Morphology",
                    reportData.morphology.rbcMorphology.test,
                    "",
                    "",
                    "morphology",
                    "rbcMorphology",
                    !viewMode
                  )}
                  {renderTableRow(
                    "WBC Morphology",
                    reportData.morphology.wbcMorphology.test,
                    "",
                    "",
                    "morphology",
                    "wbcMorphology",
                    !viewMode
                  )}
                  {renderTableRow(
                    "Platelet On Smear",
                    reportData.morphology.plateletSmear.test,
                    "",
                    "",
                    "morphology",
                    "plateletSmear",
                    !viewMode
                  )}

                  {/* ESR */}
                  {renderTableRow(
                    "ESR",
                    reportData.esr.test,
                    "mm/hr",
                    "0 - 20",
                    "top-level",
                    "esr"
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-gray-500 border-t pt-2">
              <p>Sample: EDTA WB</p>
              <p>Methodology: Modified Westergren Method</p>
              <p className="border-t border-dashed text-center mt-2 pt-2 italic">
                --------------------- End of Report ---------------------
              </p>
            </div>

            {viewMode && (
              <div className="mt-8 flex justify-between">
                <div className="text-center">
                  <div className="h-16 border-b border-black">
                    <div className="italic text-gray-400">
                      Digital Signature
                    </div>
                  </div>
                  <p className="mt-1 font-medium">Dr. ANANDA SAMANTA</p>
                  <p className="text-xs">MSc(Cli), PhD(Cal), FIC(IND)</p>
                  <p className="text-xs">Consultant Biochemist</p>
                  <p className="text-xs">Reg.No.:1859(Pb/DSc)</p>
                </div>
                <div className="text-center">
                  <div className="h-16 border-b border-black">
                    <div className="italic text-gray-400">
                      Digital Signature
                    </div>
                  </div>
                  <p className="mt-1 font-medium">
                    Dr. Sudeshna Ganguly (Nanda)
                  </p>
                  <p className="text-xs">DGO, MD</p>
                  <p className="text-xs">Pathologist</p>
                  <p className="text-xs">Reg.No.:57117(WBMC)</p>
                </div>
              </div>
            )}

            {!viewMode && (
              <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 print:hidden">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {loading
                    ? "Saving..."
                    : existingReport
                    ? "Update Report"
                    : "Save Report"}
                </button>
              </div>
            )}
          </form>

          {viewMode && (
            <div className="border-t mt-8 py-2 text-xs text-gray-500">
              <p className="font-medium">Note:</p>
              <p>
                1)In case of the sale of services including diagnostic,
                reporting, testing fee (and/or taxes, if applicable) paid is
                final. Laboratory investigation are only a tool to facilitate in
                arriving at a diagnosis and should be clinically correlated by a
                referring Medical Practitioner.
              </p>
            </div>
          )}

          {viewMode && (
            <div className="mt-6 bg-blue-50 p-2 text-center">
              <p className="text-blue-600 font-medium text-sm">
                Fair Diagnostic LLP
              </p>
              <p className="text-xs text-blue-500">
                Collection Center: Surabind Apartment, Phase 2, 70/1, B.L. Ghosh
                Road, Kolkata-700 037
              </p>
              <p className="text-xs text-blue-500">
                www.fairdiagnostic.com • fair.diagnostic@gmail.com
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;