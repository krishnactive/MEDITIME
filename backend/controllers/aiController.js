import { GoogleGenerativeAI } from "@google/generative-ai";

// init Gemini once
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// /api/ai/ask
export const askAI = async (req, res) => {
  try {
    const result = await model.generateContent({
      contents: req.body.messages.map(m => ({
        role: m.from === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }))
    });
    const response = await result.response.text();
    res.json({ text: response });
  } catch (err) {
    console.error('Gemini AI error:', err);
    if (err.status === 429) {
      res.status(429).json({ text: "AI quota exceeded, please wait or add billing." });
    } else {
      res.status(500).json({ text: "AI failed to respond.", error: err.message });
    }
  }
};

// /api/ai/test
// export const testAI = async (req, res) => {
//   try {
//     const result = await model.generateContent({
//       contents: [
//         { role: 'user', parts: [{ text: "Say hello from Dr.AI test route!" }] }
//       ]
//     });
//     const response = await result.response.text();
//     res.json({ text: response });
//   } catch (err) {
//     console.error('Gemini AI test error:', err);
//     res.status(500).json({ text: "Test failed.", error: err.message });
//   }
// };
