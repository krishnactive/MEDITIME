import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import appointmentModel from '../models/appointmentModel.js';
import authUser from '../middlewares/authUser.js';
import authDoctor from '../middlewares/authDoctor.js';

// Multer storage for appointment files
const storage = multer.diskStorage({
  destination: 'backend/uploads/appointments/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueName);
  }
});
const uploadBase = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF allowed'), false);
    }
  }
});

const upload = uploadBase.array('files', 10);
const uploadSingleFile = uploadBase.single('prescriptionFile');

// User uploads files to appointment
export const uploadFilesToAppointment = [
  authUser,
  upload,
  async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const userId = req.userId;
      
      const appointment = await appointmentModel.findOne({ _id: appointmentId, userId });
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const fileData = req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date()
      }));

      appointment.files.push(...fileData);
      await appointment.save();

      // Cleanup on error
      // req.files.forEach(file => fs.unlinkSync(file.path)); // handled in middleware

      res.json({ success: true, message: 'Files uploaded', files: fileData });
    } catch (error) {
      console.error('Upload error:', error);
      req.files?.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      res.status(500).json({ success: false, message: error.message });
    }
  }
];

// User downloads specific file
export const downloadFile = [
  authUser,
  async (req, res) => {
    try {
      const { appointmentId, filename } = req.params;
      const userId = req.userId;
      
      const appointment = await appointmentModel.findOne({ 
        _id: appointmentId, 
        userId,
        'files.filename': filename 
      });
      
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'File not found' });
      }

      const file = appointment.files.find(f => f.filename === filename);
      if (!fs.existsSync(file.path)) {
        return res.status(404).json({ success: false, message: 'File not available' });
      }

      res.download(file.path, filename, (err) => {
        if (err) {
          console.error('Download error:', err);
        } else {
          // Optional: delete local file after download
          // fs.unlinkSync(file.path);
        }
      });
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
];

// Doctor adds prescription (text or file)
export const addPrescription = [
  authDoctor,
  uploadSingleFile,
  async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const doctorId = req.doctorId;
      
      const appointment = await appointmentModel.findOne({ 
        _id: appointmentId, 
        docId: doctorId 
      });
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const prescription = {
        text: req.body.prescriptionText || '',
        createdAt: new Date()
      };

      if (req.file) {
        prescription.filePath = req.file.path;
      }

      appointment.prescription = prescription;
      await appointment.save();

      res.json({ success: true, message: 'Prescription added', prescription });
    } catch (error) {
      console.error('Prescription error:', error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
];

// User downloads prescription file
export const downloadPrescription = [
  authUser,
  async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const userId = req.userId;
      
      const appointment = await appointmentModel.findOne({ 
        _id: appointmentId, 
        userId 
      });
      
      if (!appointment?.prescription?.filePath) {
        return res.status(404).json({ success: false, message: 'No prescription available' });
      }

      if (!fs.existsSync(appointment.prescription.filePath)) {
        return res.status(404).json({ success: false, message: 'Prescription file not found' });
      }

      const filename = `prescription-${appointmentId}.pdf`;
      res.download(appointment.prescription.filePath, filename);
    } catch (error) {
      console.error('Prescription download error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
];

