import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 📌 Whisper API for Transcription
export const transcribeAudio = async (req, res) => {
  const { audioFileUrl } = req.body;

  if (!audioFileUrl) {
    return res.status(400).json({ error: "Audio file URL is required." });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        file: audioFileUrl,
        model: "whisper-1",
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const transcription = response.data.text;
    res.json({ transcription });
  } catch (err) {
    console.error("Error transcribing audio:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to process audio transcription." });
  }
};

// 📌 GPT-4 Analysis for Sentiment & Keywords
export const analyzeEntry = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required." });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: "Analyze the sentiment, keywords, and provide a summary." },
          { role: "user", content: text },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const analysis = response.data.choices[0].message.content;
    res.json({ text, analysis });
  } catch (err) {
    console.error("Error analyzing entry:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to process AI analysis." });
  }
};
