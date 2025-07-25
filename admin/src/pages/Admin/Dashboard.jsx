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
<h1>fasdfasdfas</h1>
      {/* Stats cards */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-3 bg-white p-4 min-w-52 rounded border-2 border-gray-100 hover:scale-105 transition">
          <FaUserMd className="text-4xl text-primary" />
          <div>
            <p className="text-xl font-semibold text-gray-700">{dashData.doctors}</p>
            <p className="text-gray-400">Doctors</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white p-4 min-w-52 rounded border-2 border-gray-100 hover:scale-105 transition">
          <FaCalendarAlt className="text-4xl text-primary" />
          <div>
            <p className="text-xl font-semibold text-gray-700">{dashData.appointments}</p>
            <p className="text-gray-400">Appointments</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white p-4 min-w-52 rounded border-2 border-gray-100 hover:scale-105 transition">
          <FaUsers className="text-4xl text-primary" />
          <div>
            <p className="text-xl font-semibold text-gray-700">{dashData.patients}</p>
            <p className="text-gray-400">Patients</p>
          </div>
        </div>
      </div>

      {/* Latest bookings */}
      <div className="bg-white rounded border">
        <div className="flex items-center gap-2.5 px-4 py-4 border-b">
          <FaList className="text-primary" />
          <p className="font-semibold">Latest Bookings</p>
        </div>

        <div>
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div
              key={index}
              className="flex items-center px-6 py-3 gap-3 hover:bg-gray-50 border-b last:border-b-0"
            >
              <img
                className="rounded-full w-10 h-10 object-cover bg-gray-200"
                src={item.docData.image}
                alt={`${item.docData.name}'s profile`}
              />
              <div className="flex-1 text-sm">
                <p className="text-gray-800 font-medium">{item.docData.name}</p>
                <p className="text-gray-600">Booking on {slotDateFormat(item.slotDate)}</p>
              </div>
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-500 text-xs font-medium">Completed</p>
              ) : (
                <FaTimesCircle
                  onClick={() => cancelAppointment(item._id)}
                  className="w-5 h-5 text-red-500 cursor-pointer"
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
