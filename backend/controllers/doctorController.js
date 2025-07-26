import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

// Doctor Login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) return res.json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Get appointments for doctor
const appointmentsDoctor = async (req, res) => {
  try {
    const  docId  = req.docId;
    const appointments = await appointmentModel.find({ docId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Cancel appointment
const appointmentCancel = async (req, res) => {
  try {
    const  docId  = req.docId;
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (appointment && appointment.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
      return res.json({ success: true, message: "Appointment Cancelled" });
    }

    res.json({ success: false, message: "Appointment Cancelled" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Mark appointment as completed
const appointmentComplete = async (req, res) => {
  try {
    const  docId  = req.docId;
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (appointment && appointment.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
      return res.json({ success: true, message: "Appointment Completed" });
    }

    res.json({ success: false, message: "Appointment Cancelled" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Get list of all doctors (without sensitive info)
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password -email");
    res.json({ success: true, doctors });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Toggle doctor's availability
const changeAvailablity = async (req, res) => {
  try {
    const  docId  = req.body.docId;
    const doctor = await doctorModel.findById(docId);
    if (!doctor) return res.json({ success: false, message: "Doctor not found" });

    await doctorModel.findByIdAndUpdate(docId, { available: !doctor.available });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Get doctor's profile
const doctorProfile = async (req, res) => {
  try {
    const  docId  = req.docId;
    const profileData = await doctorModel.findById(docId).select("-password");
    res.json({ success: true, profileData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Update doctor's profile
const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.docId; // Use req.docId set by authDoctor middleware
    const {  fees, address, available } = req.body;
    await doctorModel.findByIdAndUpdate(docId, { fees, address, available });
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const  docId  = req.docId;
    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;
    const patientsSet = new Set();

    appointments.forEach((appt) => {
      if (appt.isCompleted || appt.payment) earnings += appt.amount;
      patientsSet.add(appt.userId);
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patientsSet.size,
      latestAppointments: appointments.reverse()
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  doctorList,
  changeAvailablity,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile
};
