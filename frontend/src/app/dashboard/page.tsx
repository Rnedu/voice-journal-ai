"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import JournalEntry from "@/components/JournalEntry";
import VoiceRecorder from "@/components/VoiceRecorder";

interface Entry {
  entry_id: string;
  transcription: string;
  sentiment: string;
  summary: string;
  created_at: string;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);

  const fetchEntries = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/entries`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setEntries(res.data.entries))
      .catch((err) => console.error("Error fetching entries:", err));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/auth/login");
      });

    fetchEntries();
  }, [router]);

  const deleteEntry = async (entryId: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/entries/${entryId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEntries(entries.filter((entry) => entry.entry_id !== entryId));
    } catch (err) {
      console.error("❌ Error deleting entry:", err);
    }
  };

  const updateEntry = (updatedEntry: Entry) => {
    setEntries(entries.map((entry) => (entry.entry_id === updatedEntry.entry_id ? updatedEntry : entry)));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {user && <p className="text-lg mb-4">Welcome, {user.email}!</p>}

      {/* 🎙 Add Voice Recorder */}
      <VoiceRecorder onNewEntry={fetchEntries} />

      <h2 className="text-xl font-bold mt-6">Your Journal Entries</h2>
      <div className="w-full max-w-3xl mt-4 space-y-4">
        {entries.length === 0 ? (
          <p className="text-gray-500">No journal entries found.</p>
        ) : (
          entries.map((entry) => (
            <JournalEntry key={entry.entry_id} entry={entry} onDelete={deleteEntry} onUpdate={updateEntry} />
          ))
        )}
      </div>

      <button className="bg-red-500 text-white p-2 rounded mt-6" onClick={() => {
        logout();
        router.push("/auth/login");
      }}>
        Logout
      </button>
    </div>
  );
}
