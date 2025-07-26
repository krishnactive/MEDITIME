import React, { useContext } from 'react';
import { assets } from '../assets/assets';
import { DoctorContext } from '../context/DoctortContext';
import { AdminContext } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const { dToken, setDToken } = useContext(DoctorContext);
  const { aToken, setAToken } = useContext(AdminContext);
  const [navto, setNavto] = useState('');
  const navigate = useNavigate();

  const logout = () => {
    if (dToken) {
      setDToken('');
      localStorage.removeItem('dToken');
    }
    if (aToken) {
      setAToken('');
      localStorage.removeItem('aToken');
    }
    navigate('/');
  };

  const handleLogoClick = () => {
    if (aToken) navigate('/admin-dashboard');
    else if (dToken) navigate('/doctor-dashboard');
    else navigate('/');
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b border-gray-300 last:border-none bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2 text-xs">
        <img
          onClick={handleLogoClick}
          className="w-36 sm:w-40 cursor-pointer"
          src={assets.admin_logo}
          alt="Admin Logo"
        />
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          {aToken ? 'Admin' : 'Doctor'}
        </p>
      </div>
      <button
        onClick={logout}
        className="bg-primary text-white text-sm px-10 py-2 rounded-full"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
