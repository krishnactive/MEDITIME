import express from 'express';
import { uploadReport, analyzeReport } from '../controllers/reportController.js';
import authUser from '../middlewares/authUser.js'; // protect route

const router = express.Router();

router.post('/upload', authUser, uploadReport, analyzeReport);

export default router;
