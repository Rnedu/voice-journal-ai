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

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/weekly-insights`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInsights(res.data); // ✅ Now VSCode knows the structure
      } catch (err) {
        console.error("Error fetching weekly insights:", err);
      }
    };

    fetchInsights();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Weekly Insights</h1>

      {insights ? (
        <div className="p-6 border border-gray-300 rounded-lg w-full max-w-xl">
          <p><strong>Summary:</strong> {insights.summary}</p>

          <h3 className="font-bold mt-4">Sentiment Breakdown:</h3>
          <p>😊 Positive: {insights.sentimentCounts.positive}</p>
          <p>😐 Neutral: {insights.sentimentCounts.neutral}</p>
          <p>😔 Negative: {insights.sentimentCounts.negative}</p>

          <p className="font-bold mt-4">Total Entries: {insights.totalEntries}</p>
        </div>
      ) : (
        <p>Loading insights...</p>
      )}

      {/* Back to Dashboard Button */}
      <Link href="/dashboard">
        <button className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          ← Back to Dashboard
        </button>
      </Link>
    </div>
  );
}
