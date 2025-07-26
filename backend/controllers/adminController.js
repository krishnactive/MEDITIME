import validator from "validator"
import bcrypt from "bcrypt"

import {v2 as cloudinary} from "cloudinary"
import jwt from 'jsonwebtoken'

import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
//apis for adding doctor
const addDoctor = async (req,res) => {
    try {
        const {name, email ,password ,speciality, degree, experience, about, fees, address} = req.body;
        // to pass in form data we need a middle ware
        const imageFile = req.file

        //checking for all data to add doctor
        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address){
            return res.json({success:false, message: "Missing Details"});
        }

        //validating email format
        if(!validator.isEmail(email)){
            return res.json({success:false, message: "Invalid email"});
        }
        // validating strong passord    

        if(password.length<8){
            return res.json({sucess:false, message: "Please enter a strong passord"})
        }

        //hashing doctor pasord
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"});
        const imageUrl = imageUpload.secure_url;

        const doctorData = {
            name,
            email,
            image:imageUrl,
            password:hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();
        
        res.json({success: true, message: "Doctor Added"})

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}


//api for admin login
const loginAdmin = async(req, res)=>{
    try {
        const {email, password} = req.body;
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password, process.env.JWT_SECRET)
            res.json({success:true, token})
        }
        else{
            res.json({success: false, message: "Invalid credentials"});
        }
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}


//api to get all doctors list for admin panel
const allDoctors = async(req, res)=>{
    try {
        const doctors = await doctorModel.find({}).select("-password");
        res.json({success: true, doctors});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

//api to get all appointments for admin panel
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({}).populate('userData').populate('docData').sort({ createdAt: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// cancel appointment
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        // console.log("Cancel appointment ID:", appointmentId);
        // const userId = req.userId;

        const appointment = await appointmentModel.findById(appointmentId);
        // if(appointment.userId.toString() !== userId) {
        //     return res.json({ success: false, message: 'You can only cancel your own appointments' });
        // }
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }
        await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled: true});
        // Update doctor's slots
        const { docId, slotDate, slotTime } = appointment;
        const doctor = await doctorModel.findById(docId);
        if (doctor) {
            if (doctor.slots_booked[slotDate]) {
                doctor.slots_booked[slotDate] = doctor.slots_booked[slotDate].filter(slot => slot !== slotTime);
                await doctor.save();
            }
        }
        res.json({ success: true, message: 'Appointment cancelled successfully' });

    }catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get dashboard statistics for admin panel

const adminDashboardStats = async (req, res) => {
  try {
    // const totalDoctors = await doctorModel.countDocuments();
    // const totalAppointments = await appointmentModel.countDocuments();
    // const totalCancelledAppointments = await appointmentModel.countDocuments({ cancelled: true });
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
        doctors: doctors.length,
        patients: users.length,
        appointments: appointments.length,
        latestAppointments: appointments.slice(-5).reverse(),
        cancelledAppointments: appointments.filter(app => app.cancelled).length,
    }
    
    res.json({
      success: true,
      dashData
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};



export {addDoctor, loginAdmin, allDoctors, getAllAppointments, appointmentCancel, adminDashboardStats};