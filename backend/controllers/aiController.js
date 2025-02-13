import multer from "multer";
import axios from "axios";
import dotenv from "dotenv";
import FormData from "form-data";

dotenv.config();

// Configure Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// 📌 Whisper API: Transcribe Audio
export const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      console.log("❌ No file received");
      return res.status(400).json({ error: "No audio file received" });
    }

    console.log("🟢 Received file:", req.file.originalname);

    // Prepare the file for OpenAI Whisper API
    const formData = new FormData();
    formData.append("file", req.file.buffer, { filename: "recording.wav", contentType: "audio/wav" });
    formData.append("model", "whisper-1");

    const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
    });

    console.log("✅ Transcription received:", response.data.text);
    res.json({ transcription: response.data.text });
  } catch (error) {
    console.error("❌ Error transcribing audio:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to process audio transcription" });
  }
};

// 📌 GPT-4: Analyze Sentiment & Keywords
export const analyzeEntry = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required for analysis" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: "Analyze the sentiment, summary, and extract keywords from this text." },
          { role: "user", content: text },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ AI Analysis Completed:", response.data.choices[0].message.content);
    res.json({ text, analysis: response.data.choices[0].message.content });
  } catch (error) {
    console.error("❌ Error analyzing text:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze entry" });
  }
};
