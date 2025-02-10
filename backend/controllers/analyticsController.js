import AWS from "../config/aws.js";

// Initialize DynamoDB
const dynamoDB = new AWS.DynamoDB.DocumentClient();

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
