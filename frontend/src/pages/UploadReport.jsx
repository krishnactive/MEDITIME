import React, { useState } from 'react';
import { uploadMedicalReport } from '../api/reportApi';
import ReportDetails from '../components/ReportDetails';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useEffect } from 'react';

const UploadReport = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const navigate = useNavigate();
  const { userData } = useContext(AppContext);
  useEffect(() => {
    if (!userData) {
      navigate('/login');
      toast.error('Please log in to upload reports.');
    }
  }, [userData, navigate]);

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
    <div className="bg-gray-50 min-h-screen px-6 py-12 sm:px-10 md:px-20 text-gray-800">
      {/* Heading and Instructions (matches About page style) */}
      <div className="text-center mb-12">
    <h1 className="text-4xl font-bold text-blue-600">AI-Powered Report Analysis</h1>
    <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
      Upload your medical reports to get instant, AI-generated summaries and health insights — making it easier for you to understand your data.
    </p>
    <p className="text-sm text-gray-500 mt-3 max-w-xl mx-auto italic">
      ⚠️ This is an AI tool and not a substitute for professional medical advice. Always consult your doctor for diagnosis and treatment.
    </p>
  </div>

      {/* Upload Card */}
      <div className="max-w-3xl mx-auto bg-blue-50 p-8 rounded-2xl shadow-md hover:shadow-lg transition">
        <div className="flex flex-col items-center text-center space-y-6">
          <FaCloudUploadAlt className="text-blue-600 text-6xl" />
          <p className="text-lg text-gray-700 font-medium">
            Select your medical report file (.pdf, .jpg, .png)
          </p>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm w-full bg-white text-gray-700 border rounded-lg py-2 px-3 cursor-pointer shadow-sm"
          />
          {file && (
            <p className="text-sm text-gray-600">
              Selected File: <span className="font-semibold">{file.name}</span>
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className={`w-full max-w-sm flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition ${
              loading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading && <Loader2 className="animate-spin w-5 h-5" />}
            {loading ? 'Uploading...' : 'Upload Report'}
          </button>
        </div>

        {/* Report Output */}
        {reportData && (
          <div className="mt-10">
            <h3 className="text-2xl font-semibold text-blue-600 mb-4">Report Summary</h3>
            <ReportDetails data={reportData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadReport;
