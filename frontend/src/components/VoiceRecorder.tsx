"use client";
import { useState } from "react";
import { ReactMic } from "react-mic";
import axios from "axios";

export default function VoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState("");
  const [analyzedText, setAnalyzedText] = useState("");
  const [loading, setLoading] = useState(false);

  const startRecording = () => setRecording(true);
  const stopRecording = () => setRecording(false);

  const onStop = (recordedBlob: any) => {
    console.log("Recorded Blob:", recordedBlob);
    setAudioBlob(recordedBlob.blob);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/transcribe`, formData, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });

      setTranscription(response.data.transcription);
      analyzeText(response.data.transcription);
    } catch (error) {
      console.error("Error transcribing:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeText = async (text: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze`, { text }, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      setAnalyzedText(response.data.analysis);
    } catch (error) {
      console.error("Error analyzing:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">Voice Journal</h2>
      
      <ReactMic
        record={recording}
        className="border border-gray-500 rounded-lg w-64 h-20"
        onStop={onStop}
        strokeColor="red"
        backgroundColor="lightgray"
      />
      
      <div className="mt-4">
        {!recording ? (
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={startRecording}>🎙 Start Recording</button>
        ) : (
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={stopRecording}>🛑 Stop Recording</button>
        )}
      </div>

      {audioBlob && (
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
