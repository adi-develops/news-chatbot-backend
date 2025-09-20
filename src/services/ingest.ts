import axios from "axios";
import * as cheerio from "cheerio";
import { chunkText } from "../utils/chunker";
import dotenv from "dotenv";
import { embedTexts } from "../utils/embedder";
import { initCollection, qdrant } from "../db/qdrant";
import { v5 as uuidv5 } from "uuid";

const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY || "";
if (!NEWS_API_KEY) {
  console.error("❌ Missing NEWS_API_KEY in environment variables");
  process.exit(1);
}

const NEWS_API_URL = "https://newsapi.org/v2/everything";

async function fetchArticles(query: string = "technology") {
  try {
    const response = await axios.get(NEWS_API_URL, {
      params: {
        q: query,
        pageSize: 50,
        language: "en",
        apiKey: NEWS_API_KEY,
      },
    });

    if (response.data.status !== "ok") {
      throw new Error("NewsAPI error: " + response.data.message);
    }

    return response.data.articles;
  } catch (err: any) {
    console.error("Error fetching articles:", err.message);
    return [];
  }
}

async function scrapeArticle(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const $ = cheerio.load(response.data);

    const content: string[] = [];

    const headline = $("h1").first().text().trim();
    if (headline) content.push(headline);

    $("h2, h3").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 5) content.push(text);
    });

    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 50) {
        content.push(text);
      }
    });

    return content.join(" ");
  } catch (err: any) {
    console.error(`❌ Failed scraping ${url}:`, err.message);
    return null;
  }
}

// 3. Ingest pipeline
export async function ingestArticles() {
  console.log("Starting NewsAPI ingestion...");

  const collectionName = await initCollection();

  const articles = await fetchArticles();
  console.log(`Got ${articles.length} articles from NewsAPI`);

  let allArticlePoints: any = [];
  let count = 0;

  for (const article of articles) {
    const { title, url } = article;

    if (!url) continue;

    const fullText = await scrapeArticle(url);
    if (!fullText) {
      console.warn(`Skipped (no content): ${url}`);
      continue;
    }
        
    const chunks = chunkText(fullText);

    const embeddings = await embedTexts(chunks, "retrieval.passage");

    const points = embeddings.map((vector: number[], i: number) => ({
      id: uuidv5(`${url}-${i}`, NAMESPACE),
      vector,
      payload: {
        uid: `${url}-${i+1}`,
        articleUrl: url,
        articleTitle: title,
        chunkNumber: i+1,
        chunk: chunks[i],
      },
    }));

    allArticlePoints.push(...points);
    count++;
    console.log(`Ingested article ${count}: ${url}`);
    }

    await qdrant.upsert(collectionName, {
          points: allArticlePoints,
        });
  console.log("🎉 Ingestion finished");
}

if (require.main === module) {
  ingestArticles();
}
