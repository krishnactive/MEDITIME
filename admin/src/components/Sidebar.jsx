import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { DoctorContext } from '../context/DoctortContext';
import { AdminContext } from '../context/AdminContext';
import { FaHome, FaUserMd, FaCalendarAlt, FaPlus, FaUser } from 'react-icons/fa';

const Sidebar = () => {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
      isActive ? 'bg-[#acff99] border-r-4 border-[#84CC16]' : ''
    }`;

  return (
    <div className="min-h-screen bg-white border-r border-gray-300 last:border-none text-gray-700 mt-0 ">
      {aToken && (
        <ul>
          <NavLink to="/admin-dashboard" className={linkClasses}>
            <FaHome className="min-w-5 text-lg" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>
          <NavLink to="/all-appointments" className={linkClasses}>
            <FaCalendarAlt className="min-w-5 text-lg" />
            <p className="hidden md:block">Appointments</p>
          </NavLink>
          <NavLink to="/add-doctor" className={linkClasses}>
            <FaPlus className="min-w-5 text-lg" />
            <p className="hidden md:block">Add Doctor</p>
          </NavLink>
          <NavLink to="/doctor-list" className={linkClasses}>
            <FaUserMd className="min-w-5 text-lg" />
            <p className="hidden md:block">Doctors List</p>
          </NavLink>
        </ul>
      )}

      {dToken && (
        <ul>
          <NavLink to="/doctor-dashboard" className={linkClasses}>
            <FaHome className="min-w-5 text-lg" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>
          <NavLink to="/doctor-appointments" className={linkClasses}>
            <FaCalendarAlt className="min-w-5 text-lg" />
            <p className="hidden md:block">Appointments</p>
          </NavLink>
          <NavLink to="/doctor-profile" className={linkClasses}>
            <FaUser className="min-w-5 text-lg" />
            <p className="hidden md:block">Profile</p>
          </NavLink>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
