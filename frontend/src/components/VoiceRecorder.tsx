"use client";
import { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { toast } from "react-toastify";
import axios from "axios";

export default function VoiceRecorder() {
  const { startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ audio: true });
  const [transcription, setTranscription] = useState("");
  const [analyzedText, setAnalyzedText] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadAudio = async () => {
    if (!mediaBlobUrl) return;
  
    setLoading(true);
    try {
      const response = await fetch(mediaBlobUrl);
      const blob = await response.blob();
      const file = new File([blob], "recording.wav", { type: "audio/wav" });
  
      const formData = new FormData();
      formData.append("file", file);
  
      // Send to backend for transcription
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/transcribe`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      const transcription = res.data.transcription;
      setTranscription(transcription);
  
      // Analyze the text using AI
      const analysisRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze`, { text: transcription }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      setAnalyzedText(analysisRes.data.analysis);
  
      // Store the journal entry in the database
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/entries`, {
        transcription,
        sentiment: analysisRes.data.sentiment,
        summary: analysisRes.data.summary,
        tags: analysisRes.data.tags || [],
        keywords: analysisRes.data.keywords || [],
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Journal entry saved! 🎉");
  
    } catch (error) {
      console.error("❌ Upload Error:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">Voice Journal</h2>

      {mediaBlobUrl && <audio src={mediaBlobUrl} controls className="mt-2 mb-2" />}

      <div className="mt-4">
        <button 
          className={`px-4 py-2 rounded mr-2 ${status === "recording" ? "bg-gray-500 text-white" : "bg-green-500 text-white hover:bg-green-600"}`}
          onClick={startRecording} 
          disabled={status === "recording"}
        >
          {status === "recording" ? "🎤 Recording..." : "🎙 Start Recording"}
        </button>
        
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded" onClick={stopRecording}>
          🛑 Stop Recording
        </button>
      </div>

      {mediaBlobUrl && (
        <button className={`bg-blue-500 text-white px-4 py-2 rounded mt-4 ${loading ? "bg-gray-400 cursor-not-allowed" : "hover:bg-blue-600"}`} onClick={uploadAudio} disabled={loading}>
          {loading ? "Processing..." : "Upload & Analyze"}
        </button>
      )}

      {loading && <div className="w-1/2 bg-gray-300 h-2 rounded-full mt-4"><div className="bg-blue-500 h-2 animate-pulse w-3/4"></div></div>}

      {transcription && (
        <div className="mt-4 p-4 border border-gray-300 rounded-lg w-full max-w-xl">
          <h3 className="font-bold">Transcription:</h3>
          <p>{transcription}</p>
        </div>
      )}

      {analyzedText && (
        <div className="mt-4 p-4 border border-gray-300 rounded-lg w-full max-w-xl">
          <h3 className="font-bold">AI Analysis:</h3>
          <p>{analyzedText}</p>
        </div>
      )}
    </div>
  );
}
