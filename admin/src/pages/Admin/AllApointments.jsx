import React, { useEffect, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { FaTimesCircle } from 'react-icons/fa';

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext);
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);

  useEffect(() => {
    if (aToken) getAllAppointments();
  }, [aToken]);

  const downloadCSVDoctorWise = () => {
    if (!appointments.length) return;

    const grouped = appointments.reduce((acc, curr) => {
      const doctorName = curr.docData?.name || 'Unknown Doctor';
      if (!acc[doctorName]) acc[doctorName] = [];
      acc[doctorName].push(curr);
      return acc;
    }, {});

    let csvContent = '';

    Object.entries(grouped).forEach(([doctor, doctorAppointments]) => {
      csvContent += `Doctor: ${doctor}\n`;
      csvContent += 'S.No,Patient Name,Age,Date,Time,Amount,Status\n';

      doctorAppointments.forEach((item, idx) => {
        const status = item.cancelled
          ? 'Cancelled'
          : item.isCompleted
          ? 'Completed'
          : 'Scheduled';

        csvContent += `${idx + 1},${item.userData?.name},${calculateAge(item.userData?.dob)},${slotDateFormat(item.slotDate)},${item.slotTime},Rs. ${item.amount},${status}\n`;
      });

      csvContent += '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointments_doctor_wise_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl m-5">
      <div className="flex justify-between items-center mb-3">
        <p className="text-lg font-medium">All Appointments</p>
        <button
          onClick={downloadCSVDoctorWise}
          className="bg-primary text-white px-3 py-1 rounded hover:bg-primary/90 text-sm"
        >
          Download Data
        </button>
      </div>

      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b sticky top-0 bg-white z-10">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments.map((item, index) => (
          <div
            key={index}
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
          >
            <p className="max-sm:hidden">{index + 1}</p>

            <div className="flex items-center gap-2">
              <img src={item.userData?.image} className="w-8 h-8 rounded-full object-cover bg-gray-100" alt="user" />
              <p>{item.userData?.name}</p>
            </div>

            <p className="max-sm:hidden">{calculateAge(item.userData?.dob)}</p>

            <p>
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>

            <div className="flex items-center gap-2">
              <img src={item.docData?.image} className="w-8 h-8 rounded-full object-cover bg-gray-100" alt="doctor" />
              <p>{item.docData?.name}</p>
            </div>

            <p>
              {currency}
              {item.amount}
            </p>

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
  );
};

export default AllAppointments;
