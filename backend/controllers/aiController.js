import axios from "axios";

// 📌 Process Transcription with Whisper & GPT
export const analyzeEntry = async (req, res) => {
  const { audioFileUrl } = req.body;

  if (!audioFileUrl) {
    return res.status(400).json({ error: "Audio file URL is required." });
  }

  try {
    // 🎙️ Step 1: Send to Whisper API for Transcription
    const whisperResponse = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        file: audioFileUrl,
        model: "whisper-1",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const transcription = whisperResponse.data.text;

    // 🧠 Step 2: Use GPT-4 for Sentiment Analysis, Summary, and Keywords
    const gptResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: "Analyze this journal entry for sentiment, keywords, and summary." },
          { role: "user", content: transcription },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const analysis = gptResponse.data.choices[0].message.content;

    res.json({
      transcription,
      aiAnalysis: analysis,
    });

  } catch (err) {
    console.error("Error processing AI analysis:", err);
    res.status(500).json({ error: "AI processing failed." });
  }
};
