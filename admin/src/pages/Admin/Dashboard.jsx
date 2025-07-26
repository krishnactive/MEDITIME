import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { FaUserMd, FaCalendarAlt, FaUsers, FaList, FaTimesCircle } from 'react-icons/fa';

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  if (!dashData) return null;

  return (
    <div className="m-5 space-y-8">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <FaUserMd className="text-4xl text-primary" />, value: dashData.doctors, label: 'Doctors' },
          { icon: <FaCalendarAlt className="text-4xl text-primary" />, value: dashData.appointments, label: 'Appointments' },
          { icon: <FaUsers className="text-4xl text-primary" />, value: dashData.patients, label: 'Patients' },
        ].map((card, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 bg-white p-5 rounded-xl border border-gray-100 shadow hover:shadow-md transition-transform hover:-translate-y-1"
          >
            {card.icon}
            <div>
              <p className="text-2xl font-semibold text-gray-800">{card.value}</p>
              <p className="text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Latest bookings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b">
          <FaList className="text-primary" />
          <p className="font-semibold text-gray-700">Latest Bookings</p>
        </div>

        <div>
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div
              key={index}
              className="flex items-center px-6 py-3 gap-4 hover:bg-gray-50 border-b border-gray-300 last:border-none transition"
            >
              <img
                className="rounded-full w-12 h-12 object-cover bg-gray-200 border"
                src={item.docData.image}
                alt={`${item.docData.name}'s profile`}
              />
              <div className="flex-1 text-sm">
                <p className="text-gray-800 font-medium">{item.docData.name}</p>
                <p className="text-gray-500">Booking on {slotDateFormat(item.slotDate)}</p>
              </div>
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-500 text-xs font-medium">Completed</p>
              ) : (
                <FaTimesCircle
                  onClick={() => cancelAppointment(item._id)}
                  className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110 transition"
                  title="Cancel appointment"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
