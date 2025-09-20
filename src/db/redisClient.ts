import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || '';
if (!REDIS_URL) {
  console.error('❌ Missing REDIS_URL in environment variables');
  process.exit(1);
}

export const redis = createClient({ url: REDIS_URL });
redis.on('error', (err: Error) => console.error('❌ Redis Client Error', err));
redis.connect();
redis.on('connect', () => {
  console.log('✅ Connected to Redis');
})

const getSessionKey = (sessionId: string) => `session:${sessionId}:history`;

export async function saveMessage(sessionId: string, role: 'user' | 'bot', content: string) {
  const message = JSON.stringify({ role, content, timestamp: Date.now() });
  await redis.rPush(getSessionKey(sessionId), message);
}

export async function getHistory(sessionId: string) {
  const messages = await redis.lRange(getSessionKey(sessionId), 0, -1);
  return messages.map((msg: string) => JSON.parse(msg));
}

export async function clearHistory(sessionId: string) {
  await redis.del(getSessionKey(sessionId));
}
