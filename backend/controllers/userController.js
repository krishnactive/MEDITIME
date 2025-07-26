import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
// import uploadImageToCloudinary from "../utils/uploadImageToCloudinary.js";
import { v2 as cloudinary} from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user data
    const userData = { name, email, password: hashedPassword };

    // Save user to DB
    const newUser = new userModel(userData);
    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);

    return res.json({ success: true, token });

  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API to login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d' // Optional: add expiration for better security
    });

    res.json({ success: true, token });

  } catch (error) {
    console.error("Login error:", error);
    res.json({ success: false, message: error.message });
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

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
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
        const appointments = await appointmentModel.find({ userId }).sort({ date: -1 });

        if (appointments.length === 0) {
            return res.json({ success: false, message: 'No appointments found' });
        }

        res.json({ success: true, appointments });

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



export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment, paymentRazorpay, verifyRazorpay };