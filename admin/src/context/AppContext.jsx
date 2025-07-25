import { createContext } from "react";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return "";
    const parts = slotDate.split('_');
    if (parts.length !== 3) return slotDate; // fallback
    const day = parts[0];
    const monthIndex = Number(parts[1]);
    const year = parts[2];
    const month = months[monthIndex] || "";
    return `${day} ${month} ${year}`;
  };

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    // adjust if birthday hasn't occurred yet this year
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <AppContext.Provider value={{
      backendUrl,
      currency,
      slotDateFormat,
      calculateAge,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
