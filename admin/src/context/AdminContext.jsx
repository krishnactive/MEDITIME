import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(false); // optional: useful for UI
  const [error, setError] = useState(null);     // optional: useful for UI

  // Fetch all doctors from backend
  const getAllDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/all-doctors`, {
        headers: { aToken }
      });
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Change doctor's availability
  const changeAvailability = async (docId) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/admin/change-availability`, 
        { docId }, { headers: { aToken } });
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all appointments
  const getAllAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/appointments`, {
        headers: { aToken }
      });
      if (data.success) {
        setAppointments([...data.appointments].reverse());
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel an appointment
  const cancelAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/admin/cancel-appointment`,
        { appointmentId }, { headers: { aToken } });
      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard data
  const getDashData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
        headers: { aToken }
      });
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    aToken, setAToken, backendUrl,
    doctors, getAllDoctors, changeAvailability,
    appointments, getAllAppointments, cancelAppointment,
    dashData, getDashData,
    loading, error
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
