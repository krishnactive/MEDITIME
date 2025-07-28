import React, { useState, useContext, useEffect } from 'react';
import { uploadMedicalReport } from '../api/reportApi';
import ReportDetails from '../components/ReportDetails';
import { FaCloudUploadAlt, FaPlus } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const UploadReport = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const { token } = useContext(AppContext);
  // const navigate = useNavigate();

  // useEffect(() => {
  // //   if (!userData) {
  // //     navigate('/login');
  // //     toast.error('Please log in to upload reports.');
  // //   }
  // // }, [userData, navigate]);

  const handleAddPhoto = () => {
    if (files.length >= 5) {
      toast.warn('You can upload up to 5 images only.');
      return;
    }
    document.getElementById('fileInput').click();
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    if (newFiles.length + files.length > 5) {
      toast.warn('Maximum 5 images can be uploaded at a time.');
      return;
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one image file.');
      return;
    }
    setLoading(true);
    try {
      const data = await uploadMedicalReport(files, token);
      if (data) setReportData(data);
    } catch (error) {
      console.error(error);
      toast.error('Upload failed!');
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen px-6 py-12 sm:px-10 md:px-20 text-gray-800">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600">AI-Powered Report Analysis</h1>
        <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
          Upload your medical report images (JPG/PNG) to get instant AI-generated summaries and insights.
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mt-3 max-w-xl mx-auto italic leading-relaxed">
            <span className="font-medium">This is an AI-powered tool and not a substitute for professional medical advice.</span> 
              Always consult your doctor for diagnosis and treatment. <br />
            <span className="font-medium">MediTime</span> does not store any personal data or uploaded images on our servers.
        </p>

      </div>

      <div className="max-w-3xl mx-auto bg-blue-50 p-8 rounded-2xl shadow-md hover:shadow-lg transition">
        <div className="flex flex-col items-center text-center space-y-6">
          <FaCloudUploadAlt className="text-blue-600 text-6xl" />

          <button
            onClick={handleAddPhoto}
            disabled={files.length >= 5}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white ${
              files.length >= 5 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <FaPlus /> {files.length >= 5 ? 'Max 5 images' : 'Add Photo'}
          </button>

          <input
            id="fileInput"
            type="file"
            accept=".png,.jpg,.jpeg"
            style={{ display: 'none' }}
            multiple
            onChange={handleFileChange}
          />

          {files.length > 0 && (
            <div className="grid grid-cols-5 gap-2 w-full mt-4">
              {files.map((file, index) => (
                <div key={index} className="relative border rounded overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`file-${index}`}
                    className="object-cover h-20 w-full"
                  />
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs m-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className={`w-full max-w-sm flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition ${
              loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading && <Loader2 className="animate-spin w-5 h-5" />}
            {loading ? 'Uploading...' : 'Upload Report'}
          </button>
        </div>

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
