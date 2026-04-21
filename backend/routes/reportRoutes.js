import express from 'express';
import { uploadReport, analyzeReport } from '../controllers/reportController.js';
import authUser from '../middlewares/authUser.js'; // protect route
import { uploadFilesToAppointment, downloadFile, downloadPrescription } from '../controllers/appointmentFilesController.js';

const router = express.Router();

router.post('/upload', authUser, uploadReport, analyzeReport);

// New appointment file routes
router.post('/appointment/:appointmentId/upload-files', uploadFilesToAppointment);
router.get('/appointment/:appointmentId/download/:filename', downloadFile);
router.get('/appointment/:appointmentId/download-prescription', downloadPrescription);

export default router;
