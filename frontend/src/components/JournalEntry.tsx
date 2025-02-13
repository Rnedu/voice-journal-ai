"use client";
import { useState } from "react";
import axios from "axios";

interface Entry {
  entry_id: string;
  transcription: string;
  sentiment: string;
  summary: string;
  created_at: string;
}

interface Props {
  entry: Entry;
  onDelete: (entryId: string) => void;
  onUpdate: (updatedEntry: Entry) => void;
}

export default function JournalEntry({ entry, onDelete, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(entry.transcription);

  const saveEdit = async () => {
    try {
      const updatedEntry = { ...entry, transcription: editedText };
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/entries/${entry.entry_id}`,
        updatedEntry,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      onUpdate(updatedEntry);
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Error updating entry:", err);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <p className="text-sm text-gray-600">{new Date(entry.created_at).toLocaleString()}</p>

      {isEditing ? (
        <textarea className="border w-full p-2" value={editedText} onChange={(e) => setEditedText(e.target.value)} />
      ) : (
        <>
          <h3 className="font-bold mt-1">Transcription:</h3>
          <p>{entry.transcription}</p>
        </>
      )}

      <h3 className="font-bold mt-2">Sentiment:</h3>
      <p className={`text-${entry.sentiment === "positive" ? "green" : entry.sentiment === "negative" ? "red" : "gray"}-500`}>
        {entry.sentiment}
      </p>

      <h3 className="font-bold mt-2">Summary:</h3>
      <p>{entry.summary}</p>

      <div className="mt-2 flex space-x-2">
        {isEditing ? (
          <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-200" onClick={saveEdit}>
            Save
          </button>
        ) : (
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition duration-200" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        )}
        <button 
        className="bg-red-500 hover:bg-red-700 text-white p-2 rounded transition duration-200" onClick={() => onDelete(entry.entry_id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
