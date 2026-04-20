import express from 'express';
import { 
  loginDoctor, 
  appointmentsDoctor, 
  appointmentCancel, 
  doctorList, 
  changeAvailablity, 
  appointmentComplete, 
  doctorDashboard, 
  doctorProfile, 
  updateDoctorProfile,
  startCallDoctor,
  endCallDoctor,
  upcomingCallReminders
} from '../controllers/doctorController.js';
import authDoctor from '../middlewares/authDoctor.js';
import { addPrescription } from '../controllers/appointmentFilesController.js';

const doctorRouter = express.Router();

// Auth & profile routes
doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);

// Appointment routes
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.get("/call-reminders", authDoctor, upcomingCallReminders);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/start-call", authDoctor, startCallDoctor);
doctorRouter.post("/end-call", authDoctor, endCallDoctor);

// Prescription route
doctorRouter.post("/appointment/:appointmentId/prescription", authDoctor, addPrescription);

// Dashboard
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);

// Doctor list for frontend (public)
doctorRouter.get("/list", doctorList);

// Availability toggle
doctorRouter.post("/change-availability", authDoctor, changeAvailablity);

export default doctorRouter;
