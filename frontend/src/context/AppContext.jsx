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


    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider