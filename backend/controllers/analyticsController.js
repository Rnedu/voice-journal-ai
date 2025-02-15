import AWS from "../config/aws.js";

import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const getInsightsForPeriod = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required." });
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE_ENTRIES,
    };

    const data = await dynamoDB.scan(params).promise();
    const entries = data.Items.filter(entry =>
      entry.user_id === userId &&
      new Date(entry.created_at) >= new Date(startDate) &&
      new Date(entry.created_at) <= new Date(endDate)
    );

    if (!entries.length) {
      return res.json({ message: "No entries found for selected period." });
    }

    // 📊 Sentiment Breakdown
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    entries.forEach(entry => {
      if (entry.sentiment) sentimentCounts[entry.sentiment]++;
    });

    // 🔥 Generate AI Insights
    const prompt = `Here are journal entries from ${startDate} to ${endDate}: ${entries.map(e => e.transcription).join("\n")}.
    - Generate a summary of the user's experiences.
    - Identify common emotions and themes.
    - Provide one actionable self-improvement tip.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an AI assistant that generates insights from journal entries." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
    });

    const aiSummary = response.choices?.[0]?.message?.content?.trim() || "AI could not generate insights.";

    // ✅ Store insights in DynamoDB for future retrieval
    const insightId = `${userId}-${startDate}-${endDate}`;
    const saveParams = {
      TableName: process.env.DYNAMODB_TABLE_INSIGHTS,
      Item: {
        insight_id: insightId,
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        summary: aiSummary,
        sentimentCounts,
        totalEntries: entries.length,
        created_at: new Date().toISOString(),
      },
    };
    await dynamoDB.put(saveParams).promise();

    return res.json({
      summary: aiSummary,
      sentimentCounts,
      totalEntries: entries.length,
    });

  } catch (err) {
    console.error("❌ Error generating insights:", err);
    res.status(500).json({ error: "Failed to generate insights." });
  }
};


// 📌 Get Weekly Summary & Sentiment Trends
export const getWeeklyInsights = async (req, res) => {
  const userId = req.user.id;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const params = {
    TableName: process.env.DYNAMODB_TABLE_ENTRIES,
    FilterExpression: "user_id = :userId AND created_at >= :sevenDaysAgo",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":sevenDaysAgo": sevenDaysAgo.toISOString(),
    },
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    const entries = data.Items;

    if (entries.length === 0) {
      return res.json({ message: "No entries this week." });
    }

    // Sentiment Analysis Breakdown
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    entries.forEach(entry => {
      if (entry.sentiment) sentimentCounts[entry.sentiment]++;
    });

    // Generate Weekly Summary with AI
    const response = await openai.chat.completions.create({
      model: "gpt-4", // ✅ Ensure we're using GPT-4
      messages: [
        { role: "system", content: "You are an AI assistant that summarizes journal entries." },
        { role: "user", content: `Here are journal entries from the past week: ${entries.map(e => e.transcription).join("\n")}.
        - Generate a summary of the user's week.
        - Identify common emotions and themes.
        - Give one actionable self-improvement tip.` }
      ],
      max_tokens: 200,
    });
    

    // ✅ Safely handle API response
    const aiResponse = response.choices?.[0]?.message?.content?.trim() || "AI could not generate insights.";

    return res.json({
      summary: aiResponse,  // ✅ Now always returns a safe response
      sentimentCounts,
      totalEntries: entries.length,
    });
  } catch (err) {
    console.error("❌ Error generating insights:", err);
    res.status(500).json({ error: "Failed to generate insights." });
  }
};


// 📌 Get Mood Trends (Sentiment Analysis Over Time)
export const getMoodTrends = async (req, res) => {
  const userId = req.user.id; // Extracted from JWT middleware

  const params = {
    TableName: process.env.DYNAMODB_TABLE_ENTRIES,
    KeyConditionExpression: "user_id = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  try {
    const data = await dynamoDB.query(params).promise();
    const entries = data.Items;

    // Analyze mood trends (Positive, Negative, Neutral over time)
    const trends = entries.reduce((acc, entry) => {
      const date = entry.created_at.split("T")[0]; // Extract date (YYYY-MM-DD)
      if (!acc[date]) acc[date] = { positive: 0, neutral: 0, negative: 0 };

      if (entry.sentiment === "positive") acc[date].positive++;
      else if (entry.sentiment === "neutral") acc[date].neutral++;
      else acc[date].negative++;

      return acc;
    }, {});

    res.json({ moodTrends: trends });
  } catch (err) {
    console.error("Error fetching mood trends:", err);
    res.status(500).json({ error: "Error retrieving mood trends." });
  }
};

// 📌 Get Most Frequent Keywords
export const getTopKeywords = async (req, res) => {
  const userId = req.user.id;

  const params = {
    TableName: process.env.DYNAMODB_TABLE_ENTRIES,
    KeyConditionExpression: "user_id = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  try {
    const data = await dynamoDB.query(params).promise();
    const entries = data.Items;

    // Extract and count keywords
    const keywordCount = {};
    entries.forEach((entry) => {
      entry.keywords.forEach((keyword) => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
      });
    });

    // Sort keywords by frequency
    const sortedKeywords = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10 keywords

    res.json({ topKeywords: sortedKeywords });
  } catch (err) {
    console.error("Error fetching keywords:", err);
    res.status(500).json({ error: "Error retrieving keywords." });
  }
};
