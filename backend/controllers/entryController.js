import AWS from "../config/aws.js";
import { v4 as uuidv4 } from "uuid";

// Initialize DynamoDB
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// 📌 Create a New Journal Entry
export const createEntry = async (req, res) => {
  const { transcription, sentiment, tags, summary, keywords } = req.body;
  const userId = req.user.id; // Extracted from JWT middleware

  if (!transcription) {
    return res.status(400).json({ error: "Transcription is required." });
  }

  const entryId = uuidv4();
  const createdAt = new Date().toISOString();

  const params = {
    TableName: process.env.DYNAMODB_TABLE_ENTRIES,
    Item: {
      user_id: userId,
      entry_id: entryId,
      transcription,
      sentiment: sentiment || "neutral",
      tags: tags || [],
      summary: summary || "",
      keywords: keywords || [],
      created_at: createdAt,
    },
  };

  try {
    await dynamoDB.put(params).promise();
    res.status(201).json({ message: "Journal entry created.", entryId });
  } catch (err) {
    console.error("Error saving journal entry:", err);
    res.status(500).json({ error: "Error saving entry." });
  }
};


// 📌 Get Journal Entries with Pagination, Sorting & Filtering
export const getEntries = async (req, res) => {
  const userId = req.user.id;
  const { sort, sentiment, search, page = 1, limit = 10 } = req.query;

  let params = {
    TableName: process.env.DYNAMODB_TABLE_ENTRIES,
    KeyConditionExpression: "user_id = :userId",
    ExpressionAttributeValues: { ":userId": userId },
  };

  try {
    const data = await dynamoDB.query(params).promise();
    let entries = data.Items;

    // Apply Filtering
    if (sentiment) {
      entries = entries.filter(entry => entry.sentiment === sentiment);
    }

    // Apply Searching
    if (search) {
      const searchTerm = search.toLowerCase();
      entries = entries.filter(entry =>
        entry.transcription.toLowerCase().includes(searchTerm) ||
        entry.summary.toLowerCase().includes(searchTerm)
      );
    }

    // Apply Sorting
    if (sort === "newest") {
      entries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sort === "oldest") {
      entries.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    // Apply Pagination
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const totalEntries = entries.length;
    const paginatedEntries = entries.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    res.json({
      entries: paginatedEntries,
      totalEntries,
      totalPages: Math.ceil(totalEntries / pageSize),
      currentPage: pageNumber,
    });
  } catch (err) {
    console.error("❌ Error fetching journal entries:", err);
    res.status(500).json({ error: "Failed to retrieve entries." });
  }
};


// 📌 Get a Single Journal Entry
export const getEntryById = async (req, res) => {
  const { entryId } = req.params;
  const userId = req.user.id;

  const params = {
    TableName: process.env.DYNAMODB_TABLE_ENTRIES,
    Key: {
      user_id: userId,
      entry_id: entryId,
    },
  };

  try {
    const data = await dynamoDB.get(params).promise();
    if (!data.Item) {
      return res.status(404).json({ error: "Entry not found." });
    }
    res.json(data.Item);
  } catch (err) {
    console.error("Error fetching entry:", err);
    res.status(500).json({ error: "Error retrieving entry." });
  }
};

// 📌 Delete a Journal Entry
export const deleteEntry = async (req, res) => {
  const { entryId } = req.params;
  const userId = req.user.id;

  const params = {
    TableName: process.env.DYNAMODB_TABLE_ENTRIES,
    Key: {
      user_id: userId,
      entry_id: entryId,
    },
  };

  try {
    await dynamoDB.delete(params).promise();
    res.json({ message: "Journal entry deleted." });
  } catch (err) {
    console.error("Error deleting entry:", err);
    res.status(500).json({ error: "Error deleting entry." });
  }
};

// 📌 Edit a Journal Entry
export const updateEntry = async (req, res) => {
  const { entryId } = req.params;
  const { transcription, summary, sentiment, tags, keywords } = req.body;
  const userId = req.user.id;

  const params = {
    TableName: process.env.DYNAMODB_TABLE_ENTRIES,
    Key: {
      user_id: userId,
      entry_id: entryId,
    },
    UpdateExpression: "set transcription = :t, summary = :s, sentiment = :sent, tags = :tags, keywords = :keywords",
    ExpressionAttributeValues: {
      ":t": transcription,
      ":s": summary,
      ":sent": sentiment,
      ":tags": tags || [],
      ":keywords": keywords || [],
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const updatedEntry = await dynamoDB.update(params).promise();
    res.json({ message: "Journal entry updated.", updatedEntry });
  } catch (err) {
    console.error("❌ Error updating entry:", err);
    res.status(500).json({ error: "Failed to update entry." });
  }
};
