import express from 'express';
import { uploadReport, analyzeReport } from '../controllers/reportController.js';
import authUser from '../middlewares/authUser.js'; // protect route

const router = express.Router();

router.post('/upload', authUser, uploadReport, analyzeReport);

// New appointment file routes
router.post('/appointment/:appointmentId/upload-files', appointmentFilesController.uploadFilesToAppointment);
router.get('/appointment/:appointmentId/download/:filename', appointmentFilesController.downloadFile);
router.get('/appointment/:appointmentId/download-prescription', appointmentFilesController.downloadPrescription);

export default router;
