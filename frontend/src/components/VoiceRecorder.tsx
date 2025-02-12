"use client";
import { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
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
      // Convert URL to Blob
      const response = await fetch(mediaBlobUrl);
      const blob = await response.blob();
      
      // Prepare file upload
      const formData = new FormData();
      formData.append("file", blob, "recording.wav");

      // Send to backend
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/transcribe`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setTranscription(res.data.transcription);
      analyzeText(res.data.transcription);
    } catch (error) {
      console.error("Error transcribing:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeText = async (text: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze`, { text }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAnalyzedText(response.data.analysis);
    } catch (error) {
      console.error("Error analyzing:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">Voice Journal</h2>
      
      <audio src={mediaBlobUrl} controls className="mt-2 mb-2" />

      <div className="mt-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded mr-2" onClick={startRecording}>
          🎙 Start Recording
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={stopRecording}>
          🛑 Stop Recording
        </button>
      </div>

      {mediaBlobUrl && (
        <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4" onClick={uploadAudio} disabled={loading}>
          {loading ? "Processing..." : "Upload & Analyze"}
        </button>
      )}

      {transcription && (
        <div className="mt-4 p-4 border border-gray-300 rounded-lg">
          <h3 className="font-bold">Transcription:</h3>
          <p>{transcription}</p>
        </div>
      )}

      {analyzedText && (
        <div className="mt-4 p-4 border border-gray-300 rounded-lg">
          <h3 className="font-bold">AI Analysis:</h3>
          <p>{analyzedText}</p>
        </div>
      )}
    </div>
  );
}
