import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios';
import { toast } from 'react-toastify';
import {useNavigate} from 'react-router-dom';

const MyAppointments = () => {

    const {backendUrl, token, getDoctorsData} = useContext(AppContext);
    // const { appointments = [] } = useContext(AppContext) // fallback empty list
    const [payment, setPayment] = useState('')
    const [appointments, setAppointments] = useState([])
    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [uploadFiles, setUploadFiles] = useState([])
    
    const navigate = useNavigate()

    const fetchAppointments = async () => {
        try {
            const {data} = await axios.get(`${backendUrl}/api/user/appointments`, {
                headers: { token }
            });

            if (data.success) {
                const list = Array.isArray(data.appointments) ? data.appointments : [];
                setAppointments([...list].reverse());
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error(error.response?.data?.message || "Failed to fetch appointments");
        }
    };

const handleFileUpload = async () => {
    if (!selectedAppointment || uploadFiles.length === 0) return;

    const formData = new FormData();
    uploadFiles.forEach(file => formData.append('files', file));

    try {
        const response = await axios.post(
            `${backendUrl}/api/reports/appointment/${selectedAppointment._id}/upload-files`,
            formData,
            { headers: { token, 'Content-Type': 'multipart/form-data' } }
        );
        if (response.data.success) {
            toast.success('Files uploaded successfully');
            setUploadModalOpen(false);
            setSelectedAppointment(null);
            setUploadFiles([]);
            fetchAppointments();
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'Upload failed');
        console.error('Upload error:', error);
    }
};

const handleDownloadFile = (appointmentId, filename) => {
    window.open(`${backendUrl}/api/reports/appointment/${appointmentId}/download/${encodeURIComponent(filename)}`, '_blank');
};

const handleDownloadPrescription = (appointmentId) => {
    window.open(`${backendUrl}/api/reports/appointment/${appointmentId}/download-prescription`, '_blank');
};
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
            // console.log("Cancel appointment response:", appointmentId);
            if (data.success) {
                toast.success(data.message);
                fetchAppointments(); // Refresh appointments after cancellation
                getDoctorsData(); // Refresh doctor data
            } 
            else {
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
                // console.log("Payment response:", response);
                try {
                    const {data} = await axios.post(`${backendUrl}/api/user/verifyRazorpay`, response, {headers:{token}});

                    if(data.success){
                        fetchAppointments();
                        navigate('/my-appointments')
                    }

                } catch (error) {
                        console.log(error);
                        toast.error(error.message);
                }
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
                                <>
                                    <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-[#EAEFFF]'>Paid</button>
                                    {item.callRoomId && (
                                    <button onClick={() => navigate(`/video-call/${item.callRoomId}`)} className='sm:min-w-48 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600'>Join Call</button>
                                    )}
                                </>
                            )}
                            {item.isCompleted && (
                                <div className='space-y-1'>
                                    <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>
                                    {item.filesCount > 0 && (
                                        <button 
                                            onClick={() => setSelectedAppointment(item)}
                                            className='sm:min-w-48 py-1 text-xs border rounded bg-blue-100 text-blue-600 hover:bg-blue-200'
                                        >
                                            📁 {item.filesCount} file{item.filesCount > 1 ? 's' : ''}
                                        </button>
                                    )}
                                    {item.hasPrescription && (
                                        <button 
                                            onClick={() => handleDownloadPrescription(item._id)}
                                            className='sm:min-w-48 py-1 text-xs border rounded bg-purple-100 text-purple-600 hover:bg-purple-200'
                                        >
                                            💊 Download Prescription
                                        </button>
                                    )}
                                </div>
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

            {/* Upload Modal */}
            {uploadModalOpen && selectedAppointment && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto'>
                        <div className='flex justify-between items-center mb-4'>
                            <h3 className='text-xl font-semibold'>Upload Files</h3>
                            <button onClick={() => {
                                setUploadModalOpen(false);
                                setSelectedAppointment(null);
                                setUploadFiles([]);
                            }} className='text-2xl'>×</button>
                        </div>
                        <input
                            type='file'
                            multiple
                            accept='image/*,.pdf'
                            onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                            className='w-full p-3 border rounded-lg mb-4'
                        />
                        {uploadFiles.length > 0 && (
                            <div className='text-sm text-gray-600 mb-4'>
                                Selected: {uploadFiles.length} file{uploadFiles.length > 1 ? 's' : ''}
                                <ul className='mt-2 space-y-1 max-h-32 overflow-y-auto'>
                                    {uploadFiles.map((file, idx) => (
                                        <li key={idx} className='flex justify-between'>
                                            <span>{file.name}</span>
                                            <span className='font-mono text-xs opacity-75'>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className='flex gap-3'>
                            <button 
                                onClick={handleFileUpload}
                                disabled={uploadFiles.length === 0}
                                className='flex-1 bg-blue-500 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600'
                            >
                                Upload
                            </button>
                            <button 
                                onClick={() => {
                                    setUploadModalOpen(false);
                                    setSelectedAppointment(null);
                                    setUploadFiles([]);
                                }}
                                className='flex-1 border py-2 rounded-lg hover:bg-gray-100'
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyAppointments
