import { createContext, useState, useEffect } from "react";

export const AppContext = createContext()
// import { doctors } from "../assets/assets";
import axios from "axios";
import {toast} from "react-toastify";

const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [doctors, setDoctors] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [userData, setUserData] = useState(false);


    // Function to fetch doctors from backend
    const getDoctorsData = async () => {
        try {
            const {data} = await axios.get(`${backendUrl}/api/doctor/list`);
            if (data.success) {
                setDoctors(data.doctors);
            }else{
                toast.error(data.message || "Failed to fetch doctors data");
            }
        } catch (error) {
            console.error("Error fetching doctors data:", error);
            toast.error(error.message || "Failed to fetch doctors data");
        }
    }
    // Function to fetch user data from backend
    const loadUserProfileData = async () => {
        try {
            const {data} = await axios.get(`${backendUrl}/api/user/get-profile`, {headers:{token}})
            if(data.success){
                setUserData(data.userData);
            }else{
                toast.error(data.message || "Failed to fetch user data");
            }
        } catch (error) {
            console.error("Error fetching doctors data:", error);
            toast.error(error.message || "Failed to fetch doctors data");
        }
    }


    const value = {
        doctors,
         currencySymbol: "₹", // Define currency symbol globally
         token,
        setToken,
        backendUrl,
        userData,
        setUserData,
        getDoctorsData,
        loadUserProfileData
    }


    useEffect(() => {
        getDoctorsData();
    }, []);

    useEffect(() => {
        if (token) {
            loadUserProfileData();
        }
        else{
            setUserData(false);
        }
    }, [token]);

    // Poll ~30 min before scheduled appointments; toast + optional browser notification
    useEffect(() => {
        if (!token || !backendUrl) return;

        const STORAGE_KEY = "meditime_patient_call_reminders";

        const poll = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/user/call-reminders`, {
                    headers: { token },
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

                    const docName = r.docData?.name || "your doctor";
                    const msg = `Your appointment with ${docName} starts in about ${r.minutesLeft} minutes (${r.slotTime}).`;
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
    }, [token, backendUrl]);


    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider