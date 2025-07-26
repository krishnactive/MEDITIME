import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios';

const MyAppointments = () => {

    const {backendUrl, token} = useContext(AppContext);
    // const { appointments = [] } = useContext(AppContext) // fallback empty list
    const [payment, setPayment] = useState('')
    const [appointments, setAppointments] = useState([])
    
    const fetchAppointments = async () => {
        try {

            const {data} = await axios.get(`${backendUrl}/api/user/appointments`, {
                headers: { token }
            });

            if (data.success) {
                setAppointments(data.appointments.reverse());
                console.log("Appointments fetched successfully:", data.appointments);
            }

            
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error(error.response?.data?.message || "Failed to fetch appointments");


        }
    }
    useEffect(() => {
        fetchAppointments();
    }, [token]);

    const months = ["","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Format date from slotDate (e.g., 20_01_2000 => 20 Jan 2000)
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    }

    return (
        <div>
            <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>My appointments</p>
            <div>
                {/* {appointments.map((item, index) => ( */}
                  {appointments.map((item, index) => (
                    <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'>
                        <div>
                            <img className='w-36 bg-indigo-50' src={item.docData.image} alt="" />
                        </div>
                         <div className='flex-1 text-sm text-zinc-600'>
                            <p className='text-neutral-800 text-base font-semibold'>{item.docData.name}</p>
                            <p>{item.speciality}</p>
                            <p className='text-zinc-700 font-medium mt-1'>Address:</p>
                            <p className='text-xs'>{item.docData.address.line1}</p>
                            <p className='text-xs'>{item.docData.address.line2}</p>
                            <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} & {item.slotTime} </p>
                        </div>
                        
                        <div></div>
                        
                        <div className='flex flex-col gap-2 justify-end text-sm text-center'>
                            {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && (
                                <button onClick={() => setPayment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>
                            )}
                            {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && (
                                <>
                                    <button className='text-stone-500 sm:min-w-48 py-2 border rounded hover:bg-gray-100 transition-all duration-300 flex items-center justify-center'>
                                        <img className='max-w-20 max-h-5' src={assets.stripe_logo} alt="" />
                                    </button>
                                    <button className='text-stone-500 sm:min-w-48 py-2 border rounded hover:bg-gray-100 transition-all duration-300 flex items-center justify-center'>
                                        <img className='max-w-20 max-h-5' src={assets.razorpay_logo} alt="" />
                                    </button>
                                </>
                            )}
                            {!item.cancelled && item.payment && !item.isCompleted && (
                                <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-[#EAEFFF]'>Paid</button>
                            )}
                            {item.isCompleted && (
                                <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>
                            )}
                            {!item.cancelled && !item.isCompleted && (
                                <button className='text-stone-500 sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>
                            )}
                            {item.cancelled && !item.isCompleted && (
                                <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>
                            )}
                        </div>
                    </div> 
                ))}
            </div>
        </div>
    )
}

export default MyAppointments
