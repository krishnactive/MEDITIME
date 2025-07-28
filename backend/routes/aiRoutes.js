import express from 'express';
import { askAI } from '../controllers/aiController.js';
import authUser from "../middlewares/authUser.js";
import rateLimit from 'express-rate-limit';

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { text: "Too many AI requests, please slow down." }
});

router.post('/ask',authUser, aiLimiter, askAI);
// router.get('/test', testAI);

export default router;
