"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Fetch user profile
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/auth/login");
      });

    // Fetch journal entries
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/entries`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEntries(res.data.entries))
      .catch((err) => console.error("Error fetching entries:", err));
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {user && <p className="text-lg mb-4">Welcome, {user.email}!</p>}

      <h2 className="text-xl font-bold mt-6">Your Journal Entries</h2>
      <div className="w-full max-w-3xl mt-4 space-y-4">
        {entries.length === 0 ? (
          <p className="text-gray-500">No journal entries found.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.entry_id} className="p-4 border border-gray-300 rounded-lg">
              <p className="text-sm text-gray-600">{new Date(entry.created_at).toLocaleString()}</p>
              <h3 className="font-bold mt-1">Transcription:</h3>
              <p>{entry.transcription}</p>
              <h3 className="font-bold mt-2">Sentiment:</h3>
              <p className={`text-${entry.sentiment === "positive" ? "green" : entry.sentiment === "negative" ? "red" : "gray"}-500`}>
                {entry.sentiment}
              </p>
              <h3 className="font-bold mt-2">Summary:</h3>
              <p>{entry.summary}</p>
            </div>
          ))
        )}
      </div>

      <button
        className="bg-red-500 text-white p-2 rounded mt-6"
        onClick={() => {
          logout();
          router.push("/auth/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}
