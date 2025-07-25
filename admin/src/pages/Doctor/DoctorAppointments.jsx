import React, { useContext, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctortContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext);
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-auto">
        {/* Header row - hidden on small screens */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments.map((item, index) => (
          <div
            key={item._id}
            className="flex flex-wrap justify-between items-center gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
          >
            {/* Index */}
            <p className="hidden sm:block">{index + 1}</p>

            {/* Patient info */}
            <div className="flex items-center gap-2">
              <img src={item.userData.image} alt={item.userData.name} className="w-8 rounded-full" />
              <p>{item.userData.name}</p>
            </div>

            {/* Payment type */}
            <p className="text-xs border border-primary px-2 rounded-full">
              {item.payment ? 'Online' : 'CASH'}
            </p>

            {/* Age */}
            <p className="hidden sm:block">{calculateAge(item.userData.dob)}</p>

            {/* Date & time */}
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>

            {/* Fees */}
            <p>{currency}{item.amount}</p>

            {/* Action */}
            {item.cancelled ? (
              <p className="text-red-400 text-xs font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-500 text-xs font-medium">Completed</p>
            ) : (
              <div className="flex gap-1">
                <img
                  src={assets.cancel_icon}
                  alt="Cancel"
                  title="Cancel Appointment"
                  onClick={() => cancelAppointment(item._id)}
                  className="w-8 cursor-pointer"
                />
                <img
                  src={assets.tick_icon}
                  alt="Complete"
                  title="Mark as Completed"
                  onClick={() => completeAppointment(item._id)}
                  className="w-8 cursor-pointer"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
