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
  updateDoctorProfile 
} from '../controllers/doctorController.js';
import authDoctor from '../middlewares/authDoctor.js';

const doctorRouter = express.Router();

// Auth & profile routes
doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);

// Appointment routes
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);

// Dashboard
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);

// Doctor list for frontend (public)
doctorRouter.get("/list", doctorList);

// Availability toggle
doctorRouter.post("/change-availability", authDoctor, changeAvailablity);

export default doctorRouter;
