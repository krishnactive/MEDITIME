import express from 'express';
// import { loginUser, registerUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay, paymentStripe, verifyStripe } from '../controllers/userController.js';
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment, paymentRazorpay, verifyRazorpay } from '../controllers/userController.js';
import upload from '../middlewares/multer.js';
import authUser from '../middlewares/authUser.js';
const userRouter = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)

userRouter.get("/get-profile", authUser, getProfile)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.post("/book-appointment", authUser, bookAppointment)
userRouter.get("/appointments", authUser, listAppointments)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)
userRouter.post("/payment-razorpay", authUser, paymentRazorpay)
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay)
// userRouter.post("/payment-stripe", authUser, paymentStripe)
// userRouter.post("/verifyStripe", authUser, verifyStripe)

export default userRouter;