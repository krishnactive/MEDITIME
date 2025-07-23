import express from "express" ; 

import { addDoctor } from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";

const adminRouter = express.Router();

//multiple end points
adminRouter.post('/add-doctor', upload.single('file'), addDoctor);

export default adminRouter;