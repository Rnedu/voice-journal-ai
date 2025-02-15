"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

// ✅ Define TypeScript type for Insights Data
interface InsightsData {
  summary: string;
  sentimentCounts: {
    positive: number;
    neutral: number;
    negative: number;
  };
  totalEntries: number;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [endDate, setEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (!startDate || !endDate) {
      alert("Please select a date range.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/insights`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate },
      });
      setInsights(res.data);
    } catch (err) {
      console.error("Error fetching insights:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Generate Insights</h1>

      {/* Date Pickers */}
      <div className="flex gap-4 mb-4">
        <input
          type="date"
          className="border px-4 py-2 rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border px-4 py-2 rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={fetchInsights}>
          {loading ? "Generating..." : "Generate Insights"}
        </button>
      </div>

      {/* Show Insights */}
      {insights && (
        <div className="p-6 border border-gray-300 rounded-lg w-full max-w-xl">
          <p><strong>Summary:</strong> {insights.summary}</p>
          <h3 className="font-bold mt-4">Sentiment Breakdown:</h3>
          <p>😊 Positive: {insights.sentimentCounts.positive}</p>
          <p>😐 Neutral: {insights.sentimentCounts.neutral}</p>
          <p>😔 Negative: {insights.sentimentCounts.negative}</p>
          <p className="font-bold mt-4">Total Entries: {insights.totalEntries}</p>
        </div>
      )}

      {/* Back to Dashboard Button */}
      <Link href="/dashboard">
        <button className="mt-6 bg-gray-500 text-white px-4 py-2 rounded">
          ← Back to Dashboard
        </button>
      </Link>
    </div>
  );
}