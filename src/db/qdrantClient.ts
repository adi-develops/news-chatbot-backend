import { qdrant } from "./qdrant";

export async function searchTopKEmbeddings(queryEmbedding: number[], k: number = 5) {
  const collectionName = "news_articles";
  const searchResult = await qdrant.search(collectionName, {
    vector: queryEmbedding,
    limit: k,
    with_payload: true,
  });
  return searchResult.map((item: any) => item.payload);
}
