import { createContext, useState, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(localStorage.getItem('dToken') || '');
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [profileData, setProfileData] = useState(null);

    // Fetch appointments
  const getAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, {
        headers: { dToken }
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };
    // Fetch doctor profile data    
  const getProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
        headers: { dToken }
      });
      setProfileData(data.profileData);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/cancel-appointment`,
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Mark appointment as completed
  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/complete-appointment`,
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Fetch dashboard data
  const getDashData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
        headers: { dToken }
      });
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const value = {
    backendUrl,
    dToken, setDToken,
    appointments, getAppointments,
    dashData, getDashData,
    profileData, setProfileData, getProfileData,
    cancelAppointment, completeAppointment
  };

  useEffect(() => {
    if (!dToken || !backendUrl) return;

    const STORAGE_KEY = "meditime_doctor_call_reminders";

    const poll = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/doctor/call-reminders`, {
          headers: { dtoken: dToken },
        });
        if (!data?.success || !Array.isArray(data.reminders)) return;

        let shown = {};
        try {
          shown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
        } catch {
          shown = {};
        }

        for (const r of data.reminders) {
          if (shown[r.appointmentId]) continue;
          shown[r.appointmentId] = Date.now();
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(shown));

          const patientName = r.userData?.name || "Patient";
          const msg = `Your appointment with ${patientName} starts in about ${r.minutesLeft} minutes (${r.slotTime}).`;
          toast.info(msg, { autoClose: 15000 });

          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            try {
              new Notification("MediTime — Upcoming appointment", { body: msg });
            } catch (e) {
              console.warn("Notification failed:", e);
            }
          }
        }
      } catch (e) {
        console.error("call-reminders poll:", e);
      }
    };

    poll();
    const interval = setInterval(poll, 60 * 1000);
    return () => clearInterval(interval);
  }, [dToken, backendUrl]);

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
