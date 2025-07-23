import express from "express"; 

import { addDoctor, loginAdmin } from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";

const adminRouter = express.Router();

//multiple end points
adminRouter.post('/add-doctor', upload.single('file'), addDoctor);
adminRouter.post('/login', loginAdmin);

export default adminRouter;