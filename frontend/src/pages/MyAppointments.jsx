import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios';
import { toast } from 'react-toastify';

const MyAppointments = () => {

    const {backendUrl, token, getDoctorData} = useContext(AppContext);
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
    // useEffect(() => {}, [payment]);

    const months = ["","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Format date from slotDate (e.g., 20_01_2000 => 20 Jan 2000)
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    }
    const cancelAppointment = async (appointmentId) => {
        try {
            const {data} = await axios.post(`${backendUrl}/api/user/cancel-appointment`, { appointmentId }, {
                headers: { token }
            });
            console.log("Cancel appointment response:", appointmentId);
            if (data.success) {
                toast.success(data.message);
                fetchAppointments(); // Refresh appointments after cancellation
                getDoctorData(); // Refresh doctor data
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            toast.error(error.response?.data?.message || "Failed to cancel appointment");
        }
    }
    const initPayment = (order) => {
        // console.log("Razorpay Key:", import.meta.env.VITE_RAZORPAY_KEY_ID);
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
            amount: order.amount,
            currency: order.currency,
            name: "Appointment_Payment_MediTime",
            description: "Payment for appointment booking",
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                console.log("Payment response:", response);
            }
        }
        const razorpay = new window.Razorpay(options);
        razorpay.open();
    }


    const appointmentRazorpay = async (appointmentId) => {
        try {
            const {data} = await axios.post(`${backendUrl}/api/user/payment-razorpay`, { appointmentId },{headers: { token }});
            if(data.success){
                console.log("Razorpay payment data:", data.order);
                initPayment(data.order);
            } else{
                toast.error(data.message || "Failed to initiate payment");
            }
        } catch (error) {
            console.error("Error processing Razorpay payment:", error);
            toast.error(error.response?.data?.message || "Failed to process payment");
            
        }
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
                                    <button onClick={() => appointmentRazorpay(item._id)} className='text-stone-500 sm:min-w-48 py-2 border rounded hover:bg-gray-100 transition-all duration-300 flex items-center justify-center'>
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
                                <button onClick={()=>cancelAppointment(item._id)} className='text-stone-500 sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>
                            )}
                            {item.cancelled && !item.isCompleted && (
                                <button  className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>
                            )}
                        </div>
                    </div> 
                ))}
            </div>
        </div>
    )
}

export default MyAppointments
