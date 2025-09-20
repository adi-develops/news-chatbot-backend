import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";

dotenv.config();

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

// Ensure collection exists
export async function initCollection() {
  const collectionName = "news_articles";
  try {
    await qdrant.getCollection(collectionName);
  } catch {
    await qdrant.createCollection(collectionName, {
      vectors: {
        size: 1024, // jina embedding dimension
        distance: "Cosine",
      },
    });
  }
  return collectionName;
}
