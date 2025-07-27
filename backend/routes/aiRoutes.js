import express from 'express';
import { askAI, testAI } from '../controllers/aiController.js';
import authAdmin from "../middlewares/authAdmin.js";

const router = express.Router();

router.post('/ask',authAdmin, askAI);
router.get('/test', testAI);

export default router;
