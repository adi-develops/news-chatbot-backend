# News Chatbot Backend

A RAG-powered chatbot backend service that provides intelligent responses to user queries about news articles. The system ingests news articles, stores their embeddings in a vector database, manages chat sessions with Redis, and leverages Google Gemini for generating contextual responses.

## 🚀 Features

- **RAG Pipeline**: Retrieval-Augmented Generation for context-aware responses
- **News Ingestion**: Automated scraping and processing of news articles from NewsAPI
- **Vector Search**: Semantic similarity search using Jina AI embeddings and Qdrant vector database
- **Session Management**: Redis-based chat history with TTL support
- **RESTful API**: Clean endpoints for session management, querying, and data ingestion
- **TypeScript**: Full type safety and modern JavaScript features

## 🛠 Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Vector Database**: Qdrant Cloud
- **Cache & Sessions**: Redis
- **Embeddings**: Jina AI (jina-embeddings-v3)
- **LLM**: Google Gemini API (gemini-2.0-flash-001)
- **News Source**: NewsAPI.org
- **Web Scraping**: Cheerio + Axios

## 📋 API Endpoints

### Session Management

- `POST /session` - Create a new chat session
- `GET /history/:sessionId` - Retrieve chat history for a session
- `DELETE /history/:sessionId` - Clear chat history for a session

### Chat & Querying

- `POST /chat` - Send a query and get AI response with RAG context
- `POST /ingest` - Ingest new articles into the vector database

### Health Check

- `GET /` - Server status check

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- Redis instance (local or cloud)
- Qdrant Cloud account
- Google Gemini API key
- Jina AI API key
- NewsAPI key

### 1. Clone the Repository

```bash
git clone https://github.com/adi-develops/news-chatbot-backend.git
cd news-chatbot-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8000

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Qdrant Configuration
QDRANT_URL=https://your-cluster.qdrant.tech
QDRANT_API_KEY=your_qdrant_api_key

# API Keys
GEMINI_API_KEY=your_gemini_api_key
JINA_API_KEY=your_jina_api_key
NEWS_API_KEY=your_newsapi_key
```

### 4. Development

```bash
# Start development server with hot reload
npm run dev

# Server will be available at http://localhost:8000
```

### 5. Production Build

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### 6. Data Ingestion

```bash
# Ingest news articles (default: technology topics)
npm run ingest

# Or ingest specific topics via API
curl -X POST http://localhost:8000/ingest \
  -H "Content-Type: application/json" \
  -d '{"query": "artificial intelligence"}'
```

## 🚀 Deployment on Render.com

### 1. Connect Repository

1. Sign up/login to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `news-chatbot-backend` repository

### 2. Configure Build Settings

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment**: `Node`

### 3. Set Environment Variables

In the Render dashboard, add all required environment variables:

- `PORT` (Render will set this automatically)
- `REDIS_URL`
- `QDRANT_URL`
- `QDRANT_API_KEY`
- `GEMINI_API_KEY`
- `JINA_API_KEY`
- `NEWS_API_KEY`

### 4. Deploy

Click "Create Web Service" and Render will automatically build and deploy your application.

## 📁 Project Structure

```
src/
├── server.ts              # Express server setup and API routes
├── db/
│   ├── qdrant.ts          # Qdrant vector database client
│   ├── qdrantClient.ts    # Qdrant operations wrapper
│   └── redisClient.ts     # Redis session management
├── services/
│   ├── geminiClient.ts    # Google Gemini API integration
│   └── ingest.ts          # News article ingestion pipeline
└── utils/
    ├── chunker.ts         # Text chunking utilities
    └── embedder.ts        # Jina AI embeddings integration

dist/                      # Compiled JavaScript output
```

## 🧪 API Usage Examples

### Create a New Session

```bash
curl -X POST http://localhost:8000/session
# Response: {"sessionId": "uuid-here"}
```

### Send a Chat Message

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "your-session-id",
    "query": "What are the latest developments in AI?"
  }'
# Response: {"response": "AI response based on retrieved context"}
```

### Get Chat History

```bash
curl http://localhost:8000/history/your-session-id
# Response: {"history": [...]}
```

### Ingest New Articles

```bash
curl -X POST http://localhost:8000/ingest \
  -H "Content-Type: application/json" \
  -d '{"query": "climate change"}'
# Response: {"status": "Ingested 50 articles"}
```

## 🔄 How It Works

1. **Ingestion Pipeline**:

   - Fetches articles from NewsAPI based on search query
   - Scrapes full article content using Cheerio
   - Chunks text into manageable pieces
   - Generates embeddings using Jina AI
   - Stores vectors and metadata in Qdrant

2. **Query Processing**:

   - User sends query with session ID
   - Query is embedded using Jina AI
   - Vector similarity search retrieves relevant chunks
   - Context is passed to Gemini for response generation
   - Chat history is stored in Redis with TTL

3. **Session Management**:
   - Each session gets a unique UUID
   - Chat history stored in Redis with 24-hour TTL
   - Sessions can be cleared or retrieved as needed

## 🔮 Future Improvements

- **Enhanced Error Handling**: Comprehensive error responses and logging
- **Streaming Responses**: Real-time streaming of Gemini responses
- **Authentication**: JWT-based user authentication and authorization
- **Rate Limiting**: API rate limiting and request throttling
- **Monitoring**: Health checks, metrics, and performance monitoring
- **Caching**: Advanced caching strategies for embeddings and responses
- **Multi-language Support**: Support for multiple languages in ingestion and responses
- **Advanced Chunking**: Semantic chunking strategies for better context retrieval
