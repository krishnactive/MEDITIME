import React, { useState } from 'react';
import { uploadMedicalReport } from '../api/reportApi';
import ReportDetails from '../components/ReportDetails';

const UploadReport = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert('Please select a file first.');
    setLoading(true);
    try {
      const data = await uploadMedicalReport(file);
      setReportData(data);
    } catch (error) {
      console.error(error);
      alert('Upload failed!');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Upload Medical Report</h2>
      <input 
        type="file" 
        accept=".pdf,.png,.jpg,.jpeg" 
        onChange={(e) => setFile(e.target.files[0])} 
        className="mb-2"
      />
      {file && <p className="text-sm mb-2">Selected: {file.name}</p>}
      <button 
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      {reportData && <ReportDetails data={reportData} />}
    </div>
  );
};

export default UploadReport;
