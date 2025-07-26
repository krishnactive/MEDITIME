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

const exportAppointmentsAsCSV = () => {
    if (!appointments || appointments.length === 0) {
      alert('No appointment data to export!');
      return;
    }

    const header = [
      'Patient Name',
      'Patient Age',
      'Payment Type',
      'Date',
      'Time',
      'Doctor Name',
      'Doctor Speciality',
      'Fees',
      'Status'
    ];

    const rows = appointments.map(item => {
      const status = item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Upcoming';
      return [
        `"${item.userData?.name || ''}"`,
        `"${calculateAge(item.userData?.dob) || ''}"`,
        `"${item.payment ? 'Online' : 'CASH'}"`,
        `"${slotDateFormat(item.slotDate) || ''}"`,
        `"${item.slotTime || ''}"`,
        `"${item.docData?.name || ''}"`,
        `"${item.docData?.speciality || ''}"`,
        `"${item.amount || ''}"`,
        `"${status}"`
      ].join(',');
    });

    const csvContent = [header.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'appointments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  return (
    <div className="w-full max-w-6xl m-5">
      <div className="flex justify-between items-center mb-3">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <button
          onClick={exportAppointmentsAsCSV}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition text-sm"
        >
          Download Data
        </button>
       </div> 
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
