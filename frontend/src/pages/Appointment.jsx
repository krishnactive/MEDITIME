import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { FaInfoCircle, FaRupeeSign } from 'react-icons/fa';
import { assets } from '../assets/assets';
import { FaClock } from 'react-icons/fa';
import { SlCalender } from "react-icons/sl";
import { FcAlarmClock } from "react-icons/fc";
import { GrCheckboxSelected } from "react-icons/gr";
import { MdBorderColor } from "react-icons/md";
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {

  const {docId} = useParams()
  const {doctors, currencySymbol, backendUrl, token, getDoctorsData} = useContext(AppContext);
  
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const naviagte = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(null);

  const fetchDocInfo = async()=> {
    const docInfo = doctors.find(doc=>doc._id === docId);
    setDocInfo(docInfo);
  }
  // const getAvailableSlots = async () =>{}

  // const getAvailableSlots = async () =>{
  //   // setDocInfo([]);

  //   //get todays date
  //   let today = new Date();

  //   for(let i =0;i<7;i++){
  //     //get date with index 
  //     let currentDate = new Date(today);
  //     currentDate.setDate(today.getDate()+i)

  //     //setting end time of the data with index
  //     let endTime = new Date();
  //     endTime.setDate(today.getDate()+i);
  //     endTime.setHours(21,0,0,0)

  //     //setting hours means showing time after current time not displaying past times
  //     if(today.getDate() === currentDate.getDate()){
  //       currentDate.setHours(currentDate.getHours()>10 ? currentDate.getHours()+1:10);
  //       currentDate.setMinutes(currentDate.getMinutes()>30?30:0);
  //     }
  //     else{
  //       currentDate.setHours(10);
  //       currentDate.setMinutes(0);
  //     }
  //     let timeSlots = []
  //     while(currentDate < endTime){
  //       let formattedTime = currentDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

  //       //add slots to array timeSlots
  //       timeSlots.push({
  //           Datetime: new Date(currentDate),
  //           time: formattedTime
  //       })
  //       //increment current time by 30 minutes
  //       currentDate.setMinutes(currentDate.getMinutes() + 30)
  //     }
  //     setDocSlots(prev => ([...prev, timeSlots]) )
  //   }

  // }
  const getAvailableSlots = async () => {
  const allSlots = [];
  let today = new Date();

  for (let i = 0; i < 7; i++) {
    let currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);

    let endTime = new Date(currentDate);
    endTime.setHours(21, 0, 0, 0);

    if (i === 0) {
      const now = new Date();
      let nextHour = now.getHours() >= 10 ? now.getHours() + 1 : 10;
      currentDate.setHours(nextHour);
      currentDate.setMinutes(now.getMinutes() > 30 ? 30 : 0);
    } else {
      currentDate.setHours(10, 0, 0, 0);
    }

    let timeSlots = [];
    while (currentDate < endTime) {
      let formattedTime = currentDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      let day = currentDate.getDate();
      let month = currentDate.getMonth() + 1; // Months are 0-indexed
      let year = currentDate.getFullYear();

      const dateKey = `${day}_${month}_${year}`;
      const timeKey = formattedTime; // already formatted string

      const isSlotBooked = docInfo?.slots_booked?.[dateKey]?.includes(timeKey);

      if (!isSlotBooked) {
        timeSlots.push({
          Datetime: new Date(currentDate),
          time: formattedTime,
        });
      }

      currentDate.setMinutes(currentDate.getMinutes() + 30);
    }
    if(timeSlots.length>0)
    allSlots.push(timeSlots);
  }

  setDocSlots(allSlots); // Single update
};




  // Fetch doctor info based on docId and get available slots
  // This will run when the component mounts and when docId changes
  const bookAppointment = async () => {
    if (!token) {
      toast.warning('Please login to book an appointment');
      return naviagte('/login');
    }

    if (!selectedSlot || selectedDateIndex === null) {
      toast.error('Please select a date and time slot');
      return;
    }

    // Format slotDate like: day_month_year
    const dateObj = selectedSlot.Datetime;
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const slotDate = `${day}_${month}_${year}`;
    const slotTime = selectedSlot.time;
    // console.log('Booking appointment for:', docId, slotDate, slotTime);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { docId, slotDate, slotTime },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        naviagte('/my-appointments');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Something went wrong');
    }
  };


  useEffect(()=>{
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(()=>{
    getAvailableSlots();
  }, [docInfo]);

  useEffect(()=>{
    console.log(docSlots);
  },[docSlots])

  return docInfo &&(
    <div>
       {/* -----------DOCTORS INFO---------- */}
       <div className='flex flex-col sm:flex-row gap-4'>
        <div>
            <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          {/* -----------doc Info: name, degree, experience--------------- */}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name} 
            <img className='w-5' src={assets.verified_icon} alt="" /> 
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree}-{docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full' >{docInfo.experience}</button>
          </div>

          {/* --------Doctors About--------- */}
          <div >
              < p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
                About <FaInfoCircle className="text-blue-500 mr-1" title="Info" />
              </p>
              <p className='text-sm text-gray-500 max-w-[-700px] mt-1' >{docInfo.about}</p>
          </div>
          <p className="text-gray-500 font-medium mt-4">
              Appointment fee:<span className='text-green-600 font-bold'> {currencySymbol} </span><span className='text-gray-600'>{docInfo.fees}</span>
          </p>

        </div>
       </div>

   {/* --------- Booking Slots Section --------- */}

      <div className="relative sm:ml-72 px-4 pt-6 pb-28 sm:pt-10 min-h-[65vh] bg-gradient-to-b from-blue-50 to-white">

      {/* Heading */}
      <h2 className="flex items-center gap-2 text-2xl font-bold text-blue-700 mb-4"><SlCalender/> Book Your Appointment</h2>

      {/* Date Pills */}
      <div className="flex overflow-x-auto gap-3 scrollbar-hide py-2">
        {docSlots.map((daySlots, index) => {
          const dateObj = daySlots[0]?.Datetime;
          const isSelected = selectedDateIndex === index;
          const label = `${daysOfWeek[dateObj.getDay()]} ${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

          return (
            <button
              key={index}
              onClick={() => {
                setSelectedDateIndex(index);
                setSelectedSlot(null);
              }}
              className={`min-w-[110px] px-4 py-2 text-sm font-semibold rounded-full border
                transition duration-300 shadow-sm
                ${isSelected
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-600"
                  : "bg-white text-blue-700 border-gray-300 hover:bg-blue-100"}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Time Slots */}
      {selectedDateIndex !== null && (
        <>
          <h3 className="flex items-center gap-1 text-lg font-medium mt-6 mb-3 text-blue-800"> <FcAlarmClock/> Available Time</h3>
          <div className="flex flex-wrap gap-3">
            {docSlots[selectedDateIndex]?.map((slot, i) => {
              const isSelected = selectedSlot?.Datetime.getTime() === slot.Datetime.getTime();
              return (
                <button
                  key={i}
                  onClick={() => setSelectedSlot(slot)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm backdrop-blur-md border shadow-sm transition-all duration-200
                    ${isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-blue-700 border-blue-200 hover:bg-blue-100"}`}
                >
                  <FaClock className="text-sm" />
                  {slot.time}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Slot Summary & Book Button - Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-md px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 backdrop-blur-md">
        {selectedSlot && (
          <p className="flex items-center gap-1 text-sm font-medium text-blue-700 text-center sm:text-left">
            <GrCheckboxSelected/> Selected:{" "}
            <span className="text-gray-800">{selectedSlot.Datetime.toLocaleString()}</span>
          </p>
        )}
        <button
          disabled={!selectedSlot}
          onClick={bookAppointment}
          className={`px-6 py-2 rounded-full text-white font-semibold text-sm w-full sm:w-auto transition duration-300
            ${selectedSlot
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90"
              : "bg-gray-300 cursor-not-allowed"}`}
        >
           Book Appointment
        </button>
      </div>
    </div>
            
     {/* Listing related doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />

    </div>
  )
}

export default Appointment
