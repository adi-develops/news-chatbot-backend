
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { saveMessage, getHistory, clearHistory } from "./db/redisClient";
import { searchTopKEmbeddings } from "./db/qdrantClient";
import { embedTexts } from "./utils/embedder";
import { getGeminiResponse } from "./services/geminiClient";
import { ingestArticles } from "./services/ingest";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ status: "Backend is running 🚀" });
});

// POST /session: Create a new session
app.post("/session", async (_req: Request, res: Response) => {
  try {
    const sessionId = uuidv4();
    // Store empty history and set TTL (24h = 86400s)
    const { redis } = await import("./db/redisClient");
    await redis.rPush(`session:${sessionId}:history`, JSON.stringify({ role: "system", content: "Session started", timestamp: Date.now() }));
    await redis.expire(`session:${sessionId}:history`, 86400);
    res.status(201).json({ sessionId });
      } catch (err: any) {
    console.error("/session error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/chat", async (req: Request, res: Response) => {
  try {
    const { sessionId, query } = req.body;
    if (!sessionId || !query) {
      return res.status(400).json({ error: "Missing sessionId or query" });
    }

    const [queryEmbedding] = await embedTexts([query], "retrieval.query");

    const topChunks = await searchTopKEmbeddings(queryEmbedding, 5);
    const context = topChunks.map((c: any) => c.chunk).join("\n");

    const botResponse = await getGeminiResponse(context, query);

    await saveMessage(sessionId, "user", query);
    await saveMessage(sessionId, "bot", botResponse);

    res.status(200).json({ response: botResponse });
  } catch (err: any) {
    console.error("/chat error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /history/:sessionId
app.get("/history/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });
    const history = await getHistory(sessionId);
    res.status(200).json({ history });
      } catch (err: any) {
    console.error("/history error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/history/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });
    await clearHistory(sessionId);
    res.status(200).json({ status: "History cleared" });
  } catch (err: any) {
    console.error("/history delete error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/ingest", async (req: Request, res: Response) => {
  req.setTimeout(300000); // 10 minutes
  try {
    const { query } = req.body;
    const { articlesIngested } = await ingestArticles(query);
    res.status(200).json({ status: `Ingested ${articlesIngested} articles` });
  } catch (err: any) {
    console.error("/ingest error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
