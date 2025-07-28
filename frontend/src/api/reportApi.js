import axios from "axios";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const uploadMedicalReport = async (file, token) => {
  const formData = new FormData();
  formData.append("report", file);

  try {
    const { data } = await axios.post(
      `${backendUrl}/api/reports/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token, // pass user token if needed
        },
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
    toast.error(error.message || "Upload failed");
    return null;
  }
};
    