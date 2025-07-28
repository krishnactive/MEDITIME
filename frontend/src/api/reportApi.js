import axios from "axios";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const uploadMedicalReport = async (files, token) => {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file)); // multiple files

  try {
    const { data } = await axios.post(
      `${backendUrl}/api/reports/upload`,
      formData,
      {
        headers: { token },
      }
    );

    if (data.success) {
      return data;
    } else {
      toast.error(data.message || "Failed to upload report");
      return null;
    }
  } catch (error) {
    console.error("Error uploading medical report:", error);
    toast.error(error.response?.data?.message || "Upload failed");
    return null;
  }
};
