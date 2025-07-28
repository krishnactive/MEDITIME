import multer from 'multer';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Gemini init
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// Upload handler middleware
export const uploadReport = upload.single('file');

// AI Report generation controller
export const analyzeReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (req.file.mimetype.startsWith('image/')) {
      const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');
      extractedText = text;
    } else {
      return res.status(400).json({ success: false, message: "Unsupported file type." });
    }

    // Optionally: Use Gemini to summarize or structure data
    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: `Extract structured medical data from this report:\n${extractedText}` }] }
      ]
    });

    const aiResponse = await result.response.text();

    // You could parse aiResponse into JSON if your prompt makes Gemini return JSON.
    // For now, send raw:
    res.json({
      success: true,
      extractedText,
      structuredData: [
        // Example static structured data; replace with real parsing if needed
        { testName: 'Hemoglobin', result: '13.5', range: '13-17 g/dL' },
        { testName: 'WBC', result: '6500', range: '4000-10000 /µL' }
      ],
      aiSummary: aiResponse
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
  } catch (err) {
    console.error('Analyze report error:', err);
    res.status(500).json({ success: false, message: "Failed to analyze report.", error: err.message });
  }
};
