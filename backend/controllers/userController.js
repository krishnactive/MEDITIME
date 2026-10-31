import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
// import uploadImageToCloudinary from "../utils/uploadImageToCloudinary.js";
import { v2 as cloudinary} from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { selectUpcomingReminders } from "../utils/appointmentSchedule.js";
import razorpay from "razorpay";
import crypto from "crypto";

const googleLogin = async (req, res) => {
  const { credential } = req.body;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId || !process.env.JWT_SECRET) {
    console.error('Google login requires GOOGLE_CLIENT_ID and JWT_SECRET configuration.');
    return res.status(500).json({ success: false, message: 'Google login is not configured.' });
  }

  if (typeof credential !== 'string' || !credential) {
    return res.status(400).json({ success: false, message: 'Google credential is required.' });
  }

  let payload;
  try {
    const ticket = await new OAuth2Client(googleClientId).verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.error('Google credential verification failed:', error);
    return res.status(401).json({ success: false, message: 'Google sign-in failed. Please try again.' });
  }

  const googleId = payload?.sub;
  const email = payload?.email?.toLowerCase();
  if (!googleId || !email || payload?.email_verified !== true) {
    return res.status(401).json({ success: false, message: 'Google account could not be verified.' });
  }

  try {
    let user = await userModel.findOne({ googleId });
    if (!user) {
      user = await userModel.findOne({ email }).collation({ locale: 'en', strength: 2 });
    }

    if (user?.googleId && user.googleId !== googleId) {
      return res.status(409).json({ success: false, message: 'This email is linked to a different Google account.' });
    }

    if (!user) {
      user = new userModel({
        name: payload.name || email.split('@')[0],
        email,
        googleId,
        ...(payload.picture ? { image: payload.picture } : {}),
      });
    } else {
      user.googleId = googleId;
      if (payload.picture && (!user.image || user.image === 'https://ibb.co/7Js6wHdh')) {
        user.image = payload.picture;
      }
    }
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, token });

  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ success: false, message: 'Unable to complete Google sign-in. Please try again.' });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const userId = req.userId;
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//api to update user profile
const updateProfile = async(req, res)=>{
  try {
    const userId = req.userId;
    const { name, phone, address, dob, gender} = req.body;
    const  imageFile = req.file;

    if(!name || !phone ||!dob ||!gender){
      return res.json({ success: false, message: "All fields are required" });
    }
    await userModel.findByIdAndUpdate(userId, {name, phone, address:JSON.parse(address),dob, gender}) ;

    if(imageFile){
      const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type: 'image'});
      const imageUrl = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, {image: imageUrl});

    }
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
  }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {
        const userId = req.userId;
        const { docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const callRoomId = crypto.randomUUID(); // Generate unique room ID for video call

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now(),
            callRoomId
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

//api to get all appointments of user

const listAppointments = async (req, res) => {
    try {
        const userId = req.userId;
        const appointments = await appointmentModel.find({ userId }).sort({ date: -1 }).populate('files');

        // Lean for performance, add computed fields
        const appointmentsWithStats = appointments.map(apt => ({
            ...apt.toObject(),
            filesCount: apt.files ? apt.files.length : 0,
            hasPrescription: !!apt.prescription
        }));

        res.json({ success: true, appointments: appointmentsWithStats });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
    
//api to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        console.log("Cancel appointment ID:", appointmentId);
        const userId = req.userId;

        const appointment = await appointmentModel.findById(appointmentId);
        if(appointment.userId.toString() !== userId) {
            return res.json({ success: false, message: 'You can only cancel your own appointments' });
        }
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

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// API to handle Razorpay payment
const paymentRazorpay = async (req, res) => {

  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.status(404).json({ success: false, message: 'Appointment Cancelled or not found' });
    }

    // Create Razorpay order
    const options = {
      amount: appointmentData.amount * 100, // Convert to paise
      currency: process.env.CURRENCY,
      receipt:appointmentId,
    }

    // Create order
    const order = await razorpayInstance.orders.create(options)
    res.json({ success: true, order })

  } catch (error) {
    console.error("Razorpay payment error:", error);
    res.status(500).json({ success: false, message: error.message });

  }
}

// API to verify Razorpay payment
const verifyRazorpay = async (req, res) => {
    try {
        const {razorpay_order_id} = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        console.log("Razorpay Order Info:", orderInfo);

        if(orderInfo.status === 'paid'){
          await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {payment:true});
          res.json({success: true, message: "Payment Successful"});
        } else{
            res.json({success:false, message: "Payment failed"});
        }
    } catch (error) {
        console.error("Razorpay verification error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}



// API to start video call
const startCall = async (req, res) => {
    try {
        const userId = req.userId;
        const { appointmentId } = req.body;

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment || String(appointment.userId) !== String(userId)) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        if (appointment.callStartTime) {
            return res.json({ success: true, message: 'Call already in progress' });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { callStartTime: new Date() });
        res.json({ success: true, message: 'Call started' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to end video call
const endCall = async (req, res) => {
    try {
        const userId = req.userId;
        const { appointmentId } = req.body;

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment || String(appointment.userId) !== String(userId)) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        if (!appointment.callStartTime) {
            return res.json({ success: false, message: 'Call not started' });
        }

        const callDuration = Math.round((new Date() - new Date(appointment.callStartTime)) / (1000 * 60)); // in minutes
        const prev = Number(appointment.callDuration) || 0;
        await appointmentModel.findByIdAndUpdate(appointmentId, {
            callDuration: prev + callDuration,
            callStartTime: null
        });

        res.json({ success: true, message: 'Call ended', duration: callDuration });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Upcoming appointment reminders (~30 minutes before slot)
const upcomingCallReminders = async (req, res) => {
    try {
        const userId = req.userId;
        const appointments = await appointmentModel.find({ userId });
        const reminders = selectUpcomingReminders(appointments);
        res.json({ success: true, reminders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { googleLogin, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment, paymentRazorpay, verifyRazorpay, startCall, endCall, upcomingCallReminders };