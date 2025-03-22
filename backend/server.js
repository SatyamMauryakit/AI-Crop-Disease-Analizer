import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Load Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ Gemini API Key is missing in .env file!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash",
        systemInstruction: `You are an AI chatbot specializing in plants and gardening. Provide short and clear answers (maximum 30 words). If needed, summarize key points in bullet format.`

     });

    // ✅ Use correct method for Gemini API
    const result = await model.generateContentStream({ contents: [{ role: "user", parts: [{ text: userMessage }] }] });

    let reply = "";
    for await (const chunk of result.stream) {
      reply += chunk.candidates[0]?.content?.parts[0]?.text || "";
    }

    res.json({ reply: reply.trim() || "Sorry, I couldn't process that." });
  } catch (error) {
    console.error("❌ Error with Gemini API:", error);
    res.status(500).json({ reply: "Error processing request!" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
