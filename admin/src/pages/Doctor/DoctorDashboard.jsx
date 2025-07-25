import React, { useContext, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctortContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext);
  const { slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken]);

  return dashData && (
    <div className="m-5">
      
      {/* Top summary cards */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img src={assets.earning_icon} alt="Earnings" className="w-14" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{currency} {dashData.earnings}</p>
            <p className="text-gray-400">Earnings</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img src={assets.appointments_icon} alt="Appointments" className="w-14" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.appointments}</p>
            <p className="text-gray-400">Appointments</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img src={assets.patients_icon} alt="Patients" className="w-14" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.patients}</p>
            <p className="text-gray-400">Patients</p>
          </div>
        </div>
      </div>

      {/* Latest bookings list */}
      <div className="bg-white mt-10 border rounded">
        <div className="flex items-center gap-2.5 px-4 py-4 border-b">
          <img src={assets.list_icon} alt="List icon" />
          <p className="font-semibold">Latest Bookings</p>
        </div>

        <div className="pt-4">
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div
              key={item._id}
              className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100"
            >
              <img src={item.userData.image} alt={item.userData.name} className="w-10 rounded-full" />
              <div className="flex-1 text-sm">
                <p className="text-gray-800 font-medium">{item.userData.name}</p>
                <p className="text-gray-600">Booking on {slotDateFormat(item.slotDate)}</p>
              </div>
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-500 text-xs font-medium">Completed</p>
              ) : (
                <div className="flex gap-1">
                  <img
                    src={assets.cancel_icon}
                    alt="Cancel"
                    title="Cancel appointment"
                    onClick={() => cancelAppointment(item._id)}
                    className="w-8 cursor-pointer"
                  />
                  <img
                    src={assets.tick_icon}
                    alt="Complete"
                    title="Mark as completed"
                    onClick={() => completeAppointment(item._id)}
                    className="w-8 cursor-pointer"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
