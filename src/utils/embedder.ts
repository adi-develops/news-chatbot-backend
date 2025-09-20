import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const JINA_API_URL = "https://api.jina.ai/v1/embeddings";

export async function embedTexts(texts: string[], task: "retrieval.query" | "retrieval.passage") {
  try {
    const resp = await axios.post(
      JINA_API_URL,
      {
        model: "jina-embeddings-v3",
        task,
        input: texts,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.JINA_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!resp.data || !Array.isArray(resp.data.data)) {
      throw new Error("Invalid response from Jina API: missing or malformed 'data' field");
    }

    return resp.data.data.map((d: any) => d.embedding as number[]);
  } catch (err: any) {
    console.error("❌ Error in embedTexts:", err?.response?.data || err.message || err);
    return [];
  }
}
