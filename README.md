# RAG Chatbot - AI-Powered Document Assistant

A full-stack RAG (Retrieval-Augmented Generation) chatbot that allows users to upload PDF and DOCX documents and chat with an AI about their content. Built with React, Express.js, LangChain, FAISS, and Google Gemini.

![RAG Chatbot](https://img.shields.io/badge/RAG-Chatbot-blue) ![Node.js](https://img.shields.io/badge/Node.js-20+-green) ![React](https://img.shields.io/badge/React-18+-blue) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## 🚀 Features

- **📄 Document Upload**: Upload one or multiple PDF and DOCX files (max 5 files, 10MB each)
- **🤖 AI-Powered Chat**: Ask questions about uploaded documents using Google Gemini 2.0 Flash
- **🔒 Session-Based**: Each user session maintains its own vector store and chat history
- **🧹 Auto-Cleanup**: Documents and embeddings automatically cleared on session end
- **💅 Responsive UI**: Modern, clean interface built with React and Tailwind CSS
- **🐳 Dockerized**: Fully containerized with Docker Compose for easy deployment
- **⚡ Fast Vector Search**: FAISS-powered semantic search with HuggingFace embeddings
- **📝 Markdown Support**: Rich markdown rendering in chat responses

## 📋 Prerequisites

- **Node.js** 20+ (for local development)
- **Docker** and **Docker Compose** (for containerized deployment)
- **Google Gemini API Key** - Get it from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                         │
│                     (React + Tailwind CSS)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/HTTPS
                         │ (Port 80/443)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NGINX (Frontend)                           │
│              Serves React SPA + Static Assets                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ API Calls
                         │ (Port 5000)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXPRESS.JS BACKEND                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Middleware Layer                                        │   │
│  │  • CORS • Helmet • Sessions • Error Handler • Multer     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Routes                                                  │   │
│  │  • /api/upload  • /api/chat  • /api/session              │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Controllers                                             │   │
│  │  • uploadController  • chatController  • sessionCtrl     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Services (Business Logic)                               │   │
│  │  • ragService        • vectorStoreService                │   │
│  │  • sessionService    • documentLoader                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬──────────────────────┬────────────────────────-┘
                 │                      │
                 ▼                      ▼
     ┌────────────────────┐  ┌──────────────────────┐
     │     File System    │  │     Memory Store     │
     │   (uploads/)       │  │  • Vector Stores     │
     │   • PDF Files      │  │  • Sessions          │
     │   • DOCX Files     │  │  • Chat History      │
     └────────────────────┘  └──────────────────────┘
                 │
                 ▼
     ┌────────────────────────────────────────┐
     │           External Services            │
     │  ┌──────────────────┐ ┌──────────────┐ │
     │  │ Google Gemini    │ │ HuggingFace  │ │
     │  │ (LLM - 2.0 Flash)│ │ (Embeddings) │ │
     │  └──────────────────┘ └──────────────┘ │
     └────────────────────────────────────────┘
```

### Data Flow Diagram

#### 1. Document Upload Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Select/Drop Files (PDF/DOCX)
     ▼
┌─────────────────┐
│  FileUpload     │
│  Component      │
└────┬────────────┘
     │ 2. POST /api/upload (multipart/form-data)
     ▼
┌─────────────────────────┐
│  uploadMiddleware       │
│  (Multer)               │
│  • Validate file type   │
│  • Check file size      │
│  • Save to uploads/     │
└────┬────────────────────┘
     │ 3. Files saved
     ▼
┌─────────────────────────┐
│  uploadController       │
│  • Get file paths       │
└────┬────────────────────┘
     │ 4. Process documents
     ▼
┌─────────────────────────┐
│  ragService             │
│  processDocuments()     │
└────┬────────────────────┘
     │ 5. Load documents
     ▼
┌─────────────────────────┐
│  documentLoader         │
│  • Parse PDF/DOCX       │
│  • Extract text         │
└────┬────────────────────┘
     │ 6. Document chunks
     ▼
┌─────────────────────────┐
│  vectorStoreService     │
│  createVectorStore()    │
└────┬────────────────────┘
     │ 7a. Split into chunks (1000 chars, 200 overlap)
     ▼
┌─────────────────────────┐
│  HuggingFace            │
│  all-MiniLM-L6-v2       │
│  • Generate embeddings  │
└────┬────────────────────┘
     │ 7b. Embeddings (384-dim vectors)
     ▼
┌─────────────────────────┐
│  FAISS                  │
│  • Create index         │
│  • Store vectors        │
└────┬────────────────────┘
     │ 8. Vector store created
     ▼
┌─────────────────────────┐
│  sessionService         │
│  • Store vectorStore    │
│  • Link to session      │
└────┬────────────────────┘
     │ 9. Success response
     ▼
┌─────────────────┐
│  Frontend       │
│  • Show success │
│  • Display files│
└─────────────────┘
```

#### 2. Chat/Query Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Type question
     ▼
┌─────────────────┐
│  MessageInput   │
│  Component      │
└────┬────────────┘
     │ 2. POST /api/chat { question }
     ▼
┌─────────────────────────┐
│  chatController         │
│  • Get session ID       │
│  • Extract question     │
└────┬────────────────────┘
     │ 3. Process query
     ▼
┌─────────────────────────┐
│  ragService             │
│  chat()                 │
└────┬────────────────────┘
     │ 4. Get session data
     ▼
┌─────────────────────────┐
│  sessionService         │
│  • Retrieve vectorStore │
│  • Get chat history     │
└────┬────────────────────┘
     │ 5a. Embed question
     ▼
┌─────────────────────────┐
│  HuggingFace            │
│  all-MiniLM-L6-v2       │
│  • Convert to vector    │
└────┬────────────────────┘
     │ 5b. Question vector
     ▼
┌─────────────────────────┐
│  FAISS VectorStore      │
│  similaritySearch()     │
│  • Find top 3 matches   │
└────┬────────────────────┘
     │ 6. Retrieved chunks
     ▼
┌─────────────────────────┐
│  ragService             │
│  • Format context       │
│  • Build prompt         │
└────┬────────────────────┘
     │ 7. Prompt with context
     ▼
┌─────────────────────────┐
│  Google Gemini          │
│  gemini-2.0-flash       │
│  • Generate answer      │
└────┬────────────────────┘
     │ 8. AI response
     ▼
┌─────────────────────────┐
│  ragService             │
│  • Save to history      │
└────┬────────────────────┘
     │ 9. Return answer
     ▼
┌─────────────────┐
│  ChatInterface  │
│  • Display msg  │
│  • Render MD    │
└─────────────────┘
```

### Component Interaction Diagram

```
Frontend (React)                Backend (Express.js)
═══════════════════            ═══════════════════════

┌─────────────┐                ┌──────────────────┐
│   App.jsx   │────────────────│  Session Mgmt    │
│             │  Session Cookie│  Middleware      │
└──────┬──────┘                └──────────────────┘
       │
       ├─────┬─────────┬────────────┐
       │     │         │            │
       ▼     ▼         ▼            ▼
┌──────────┐ ┌─────┐ ┌──────┐ ┌──────────┐
│FileUpload│ │Chat │ │Msg   │ │Session   │
│Component │ │Intf │ │Input │ │Controls  │
└────┬─────┘ └──┬──┘ └───┬──┘ └────┬─────┘
     │          │        │         │
     │          └────────┴─────────┘
     │                   │
     ▼                   ▼
┌─────────────────────────────────┐
│     api.js (Axios)              │
│  • uploadFiles()                │
│  • sendChatMessage()            │
│  • getChatHistory()             │
│  • clearSession()               │
└────────────┬────────────────────┘
             │ HTTP Requests
             ▼
     ┌───────────────────┐
     │   Routes          │
     │  /api/upload      │◄──── uploadMiddleware (Multer)
     │  /api/chat        │
     │  /api/session     │
     └────────┬──────────┘
              │
     ┌────────┴──────────┐
     │   Controllers     │
     │  uploadController │
     │  chatController   │
     │  sessionCtrl      │
     └────────┬──────────┘
              │
     ┌────────┴──────────┐
     │    Services       │
     │  ragService       │◄─── Google Gemini API
     │  vectorStoreService│◄─── HuggingFace
     │  sessionService   │
     │  documentLoader   │
     └───────────────────┘
```

### RAG Pipeline Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    RAG PROCESSING PIPELINE                      │
└────────────────────────────────────────────────────────────────┘

Step 1: DOCUMENT INGESTION
────────────────────────────
┌──────────────┐
│ User Upload  │
│ PDF/DOCX     │
└──────┬───────┘
       │
       ▼
┌─────────────────────┐
│ Document Loaders    │
│ • PDFLoader         │
│ • DocxLoader        │
└──────┬──────────────┘
       │ Raw Text
       ▼

Step 2: TEXT CHUNKING
────────────────────────────
┌─────────────────────────────┐
│ RecursiveCharacterSplitter  │
│ • Chunk Size: 1000 chars    │
│ • Overlap: 200 chars        │
│ • Preserves context         │
└──────┬──────────────────────┘
       │ Text Chunks
       ▼

Step 3: EMBEDDING GENERATION
────────────────────────────
┌─────────────────────────────┐
│ HuggingFace Embeddings      │
│ Model: all-MiniLM-L6-v2     │
│ • Input: Text chunks        │
│ • Output: 384-dim vectors   │
└──────┬──────────────────────┘
       │ Vector Embeddings
       ▼

Step 4: VECTOR STORAGE
────────────────────────────
┌─────────────────────────────┐
│ FAISS Vector Store          │
│ • Index Type: Flat (L2)     │
│ • In-Memory Storage         │
│ • Per-Session Isolation     │
└──────┬──────────────────────┘
       │ Vector Store Ready
       ▼

Step 5: QUERY PROCESSING
────────────────────────────
┌──────────────┐
│ User Query   │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│ Embed Query                 │
│ (same embedding model)      │
└──────┬──────────────────────┘
       │ Query Vector
       ▼

Step 6: SIMILARITY SEARCH
────────────────────────────
┌─────────────────────────────┐
│ FAISS Similarity Search     │
│ • Algorithm: Cosine Sim     │
│ • Retrieve Top K=3          │
│ • Return relevant chunks    │
└──────┬──────────────────────┘
       │ Relevant Context
       ▼

Step 7: PROMPT CONSTRUCTION
────────────────────────────
┌─────────────────────────────┐
│ LangChain Prompt Template   │
│ • System Instructions       │
│ • Context: Retrieved chunks │
│ • User Question             │
└──────┬──────────────────────┘
       │ Formatted Prompt
       ▼

Step 8: GENERATION
────────────────────────────
┌─────────────────────────────┐
│ Google Gemini 2.0 Flash     │
│ • Temperature: Default      │
│ • Max Tokens: Auto          │
│ • Response: Text            │
└──────┬──────────────────────┘
       │ Generated Answer
       ▼

Step 9: POST-PROCESSING
────────────────────────────
┌─────────────────────────────┐
│ • Save to chat history      │
│ • Format response           │
│ • Return to user            │
└──────┬──────────────────────┘
       │
       ▼
┌──────────────┐
│ User Sees    │
│ AI Response  │
└──────────────┘
```

### Session Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SESSION LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│ User Opens   │
│ Application  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────┐
│ Session Middleware      │
│ • Check session cookie  │
│ • No session exists?    │
└──────┬──────────────────┘
       │ YES - Create New
       ▼
┌─────────────────────────────────┐
│ sessionService.createSession()  │
│ • Generate unique ID (UUID)     │
│ • Initialize empty state:       │
│   - vectorStore: null           │
│   - chatHistory: []             │
│   - uploadedFiles: []           │
│   - createdAt: timestamp        │
│   - lastAccessedAt: timestamp   │
└──────┬──────────────────────────┘
       │ Session Created
       ▼
┌─────────────────────────────────┐
│ Store in Express Session        │
│ • Set cookie: connect.sid       │
│ • Save ragSessionId             │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ User Uploads Documents          │
│ • Files saved to uploads/       │
│ • Vector store created          │
│ • Linked to session             │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ User Chats (Multiple Times)     │
│ • Each message saved            │
│ • Chat history maintained       │
│ • lastAccessedAt updated        │
└──────┬──────────────────────────┘
       │
       ├─────────────┬──────────────────────┐
       │             │                      │
       ▼             ▼                      ▼
┌──────────────┐ ┌──────────────┐  ┌──────────────────┐
│ User Clears  │ │ User Closes  │  │ Session Timeout  │
│ Session      │ │ Browser      │  │ (30 min idle)    │
│ (Manual)     │ │ (Cookie exp) │  │ (Auto cleanup)   │
└──────┬───────┘ └──────┬───────┘  └──────┬───────────┘
       │                │                  │
       └────────────────┴──────────────────┘
                        │
                        ▼
       ┌────────────────────────────────┐
       │ sessionService.clearSession()  │
       │ • Delete uploaded files        │
       │ • Clear vector store (memory)  │
       │ • Clear chat history           │
       │ • Remove from sessions map     │
       └────────────────────────────────┘
                        │
                        ▼
       ┌────────────────────────────────┐
       │ Session Destroyed              │
       │ Resources freed                │
       └────────────────────────────────┘

Background Process:
┌─────────────────────────────────────────┐
│ Cleanup Service (runs every 10 min)    │
│ • Check all sessions                    │
│ • Find inactive > SESSION_TTL (30 min) │
│ • Auto-clear expired sessions           │
│ • Free memory resources                 │
└─────────────────────────────────────────┘
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DOCKER COMPOSE                          │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │  Docker Network  │
                    │  rag-chatbot-net │
                    └────────┬─────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                 │
            ▼                                 ▼
┌────────────────────────┐        ┌────────────────────────┐
│  Frontend Container    │        │  Backend Container     │
│  ────────────────────  │        │  ───────────────────   │
│  • Node:20-alpine      │        │  • Node:20-alpine      │
│  • Build: Vite         │        │  • Runtime: Node.js    │
│  • Serve: Nginx        │        │  • Express.js app      │
│  • Port: 80            │◄───────│  • Port: 5000          │
│  • Health: /health     │  API   │  • Health: /api/health │
└────────┬───────────────┘ Calls  └────────┬───────────────┘
         │                                  │
         │                                  │
    Serves Static                    ┌─────┴──────┐
    React App                        │            │
         │                           ▼            ▼
         │                  ┌─────────────┐ ┌─────────────┐
    User Browser            │ Volume:     │ │ Volume:     │
         │                  │ uploads/    │ │ cache/      │
         │                  │ (Persist)   │ │ (Models)    │
         └─────────────────►└─────────────┘ └─────────────┘
              Port 80
                                     │
                              External APIs
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
           ┌──────────────────┐          ┌──────────────────┐
           │ Google Gemini    │          │ HuggingFace      │
           │ API (LLM)        │          │ Transformers     │
           │ gemini-2.0-flash │          │ all-MiniLM-L6-v2 │
           └──────────────────┘          └──────────────────┘
```

### Technology Stack

**Backend:**
- Express.js - Web framework
- LangChain - RAG orchestration
- FAISS - Vector store
- HuggingFace Transformers - Text embeddings (all-MiniLM-L6-v2)
- Google Gemini 2.0 Flash - LLM
- Multer - File upload handling
- Express Session - Session management

**Frontend:**
- React 18 - UI framework
- Vite - Build tool
- Tailwind CSS - Styling
- React Dropzone - File upload interface
- React Markdown - Markdown rendering
- Axios - HTTP client

### Project Structure

```
rag-chatbot/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   │   ├── uploadController.js
│   │   │   ├── chatController.js
│   │   │   └── sessionController.js
│   │   ├── services/        # Business logic
│   │   │   ├── ragService.js          # RAG implementation
│   │   │   ├── vectorStoreService.js  # FAISS operations
│   │   │   └── sessionService.js      # Session management
│   │   ├── routes/          # API routes
│   │   │   ├── uploadRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   └── sessionRoutes.js
│   │   ├── middleware/      # Express middleware
│   │   │   ├── uploadMiddleware.js    # Multer config
│   │   │   ├── sessionMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── utils/           # Utility functions
│   │   │   └── documentLoader.js      # PDF/DOCX loaders
│   │   └── app.js           # Express app entry point
│   ├── uploads/             # Uploaded files storage
│   ├── .env                 # Environment variables
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── hooks/           # Custom hooks
│   │   │   ├── useChat.js
│   │   │   └── useSession.js
│   │   ├── services/        # API service
│   │   │   └── api.js
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── Dockerfile
│   ├── nginx.conf           # Nginx configuration
│   └── package.json
│
├── docker-compose.yml       # Docker orchestration
└── README.md                # This file
```

## 🚀 Quick Start with Docker (Recommended)

### 1. Clone and Setup

```bash
# Create .env file in root directory
cat > .env << EOF
GOOGLE_API_KEY=your_google_gemini_api_key_here
SESSION_SECRET=your_random_secret_string_here
EOF
```

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

### 3. Access the Application

- Frontend: http://localhost
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

### 4. Stop the Application

```bash
docker-compose down
```

## 🛠️ Local Development Setup

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create `.env` file**:
```bash
# Copy your Google Gemini API Key from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your_random_secret_key_here

# Upload Limits
MAX_FILE_SIZE=10485760  # 10MB
MAX_FILES=5

# Session TTL (milliseconds) - 30 minutes
SESSION_TTL=1800000
```

4. **Start the backend**:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create `.env` file** (optional):
```bash
VITE_API_URL=http://localhost:5000
```


4. **Start the frontend**:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📡 API Endpoints

### Upload

- **POST** `/api/upload` - Upload PDF/DOCX files
  - Body: `multipart/form-data` with `files` field
  - Response: Upload confirmation with file count and document count

### Chat

- **POST** `/api/chat` - Send a chat message
  - Body: `{ "question": "Your question here" }`
  - Response: `{ "success": true, "data": { "answer": "AI response" } }`

- **GET** `/api/chat/history` - Get chat history
  - Response: Array of chat messages with roles and timestamps

### Session

- **GET** `/api/session` - Get session information
  - Response: Session details, uploaded files count, document count

- **DELETE** `/api/session` - Clear current session
  - Response: Confirmation and new session ID

### Health

- **GET** `/api/health` - Health check
  - Response: Server status and active session count

## 🎯 Usage Guide

### 1. Upload Documents

- Click or drag-and-drop PDF/DOCX files into the upload area
- Wait for the success notification
- Supported formats: `.pdf`, `.docx`
- Limits: Max 5 files, 10MB each

### 2. Chat with Your Documents

- Type your question in the input field at the bottom
- Press Enter or click Send
- AI will respond based on document content
- Chat history is maintained during your session

### 3. Clear Session

- Click the "Clear Session" button in the header to reset
- This deletes all uploaded files and chat history
- Session also clears automatically when you close the browser

## ⚙️ Configuration

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_API_KEY` | - | **Required**: Google Gemini API key |
| `PORT` | 5000 | Backend server port |
| `SESSION_SECRET` | - | **Required**: Secret for session encryption |
| `MAX_FILE_SIZE` | 10485760 | Max file size in bytes (10MB) |
| `MAX_FILES` | 5 | Max number of files per upload |
| `SESSION_TTL` | 1800000 | Session timeout in ms (30 minutes) |
| `NODE_ENV` | development | Environment mode |
| `FRONTEND_URL` | http://localhost:5173 | Frontend URL for CORS |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | http://localhost:5000 | Backend API URL |

## 🔍 How It Works (RAG Pipeline)

### 1. Document Upload & Processing

```
User uploads PDF/DOCX → Backend receives files → 
Parse documents to text → Split into chunks (1000 chars, 200 overlap) →
Generate embeddings using HuggingFace (all-MiniLM-L6-v2) →
Store in FAISS vector store (in-memory, per session)
```

### 2. Question Answering

```
User asks question → Embed question using same model →
Search FAISS for top 3 most relevant chunks →
Combine chunks as context →
Send context + question to Google Gemini 2.0 Flash →
Generate answer based only on provided context →
Return answer to user
```

### 3. Session Management

- Each user gets a unique session ID (stored in cookies)
- Sessions store: vector store, uploaded files, chat history
- Auto-cleanup runs every 10 minutes to remove inactive sessions
- Sessions expire after 30 minutes of inactivity

## 🛠️ Troubleshooting

### Common Issues

**1. Upload fails with "Network Error"**
- Check if backend is running on port 5000
- Verify CORS settings in `backend/src/app.js`
- Ensure frontend is accessing correct API URL

**2. "No documents uploaded" error when chatting**
- Upload documents first before asking questions
- Check if upload was successful (green notification)
- Try clearing session and re-uploading

**3. Docker container fails to start**
- Verify `.env` file exists with required variables
- Check if ports 80 and 5000 are available
- Run `docker-compose logs` to see error details

**4. Slow response times**
- First request is slow due to model loading
- Subsequent requests should be faster
- Consider increasing memory allocation for Docker

**5. "Invalid file type" error**
- Only PDF and DOCX files are supported
- Check file extension is exactly `.pdf` or `.docx`
- Ensure file is not corrupted

## 📝 Development Notes

### Adding New Document Types

To support additional file formats, modify:
1. `backend/src/utils/documentLoader.js` - Add new loader
2. `backend/src/middleware/uploadMiddleware.js` - Update file filter
3. `frontend/src/components/FileUpload.jsx` - Update accepted types

### Changing the LLM

To use a different model, modify `backend/src/services/ragService.js`:
- Update `initializeGemini()` method
- Change model configuration
- Adjust prompt template if needed

### Customizing Embeddings

To use different embeddings, modify `backend/src/services/vectorStoreService.js`:
- Change the `modelName` in `getEmbeddings()`
- Options: any HuggingFace transformers model

## 🚀 Production Deployment

### Docker Deployment (Recommended)

1. Set production environment variables
2. Build and run with Docker Compose:

```bash
docker-compose up -d --build
```

3. Use a reverse proxy (nginx/traefik) for HTTPS
4. Set `NODE_ENV=production` in backend
5. Configure proper session secrets

### Manual Deployment

**Backend:**
```bash
cd backend
npm install --production
NODE_ENV=production node src/app.js
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
# Serve dist/ folder with nginx or similar
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

If you have any questions or run into issues:
1. Check the troubleshooting section above
2. Review the console logs for error details
3. Open an issue on GitHub

## 🔗 Links

- [Google Gemini API](https://makersuite.google.com/app/apikey)
- [LangChain Documentation](https://js.langchain.com/)
- [FAISS](https://faiss.ai/)
- [React Documentation](https://react.dev/)

---

**Built with ❤️ using React, Express.js, LangChain, and Google Gemini**

3. **Session Management**:
   - Each user gets a unique session ID
   - Vector store and chat history tied to session
   - Inactive sessions cleaned up after 30 minutes
   - Page refresh triggers session cleanup

## 🐛 Troubleshooting

### Backend Issues

**Error: "GOOGLE_API_KEY not found"**
- Ensure `.env` file exists in backend directory
- Check that `GOOGLE_API_KEY` is set correctly

**Error: "Failed to load documents"**
- Verify file format is PDF or DOCX
- Check file size is under 10MB
- Ensure backend has write permissions for `uploads/` folder

**Error: "Model download timeout"**
- First run downloads HuggingFace model (~50MB)
- Wait a few minutes or check internet connection
- Docker: Model cached in `huggingface-cache` volume

### Frontend Issues

**Files not uploading**
- Check backend is running on port 5000
- Verify CORS settings in backend
- Check browser console for errors

**Chat not working**
- Ensure documents are uploaded first
- Check backend logs for errors
- Verify Gemini API key is valid

### Docker Issues

**Port already in use**
- Change ports in `docker-compose.yml`
- Or stop conflicting services

**Container fails to start**
- Check logs: `docker-compose logs`
- Ensure `.env` file exists with API key
- Try rebuilding: `docker-compose up --build`

## 📝 Development Notes

- **Vector Store**: In-memory only, not persisted to disk
- **Embeddings**: Cached in Docker volume for faster restarts
- **Session Storage**: Express-session with memory store (use Redis for production scale)
- **File Cleanup**: Uploaded files cleared with session (automatic)

## 🚀 Production Recommendations

1. **Use Redis** for session storage (scalability)
2. **Implement rate limiting** on API endpoints
3. **Add authentication** for multi-user support
4. **Set up monitoring** (health checks, logging)
5. **Use HTTPS** with valid SSL certificates
6. **Configure nginx** reverse proxy
7. **Set resource limits** in Docker (memory, CPU)
8. **Implement file scanning** for security

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Check existing issues for solutions

---

**Built with ❤️ by Maitrek Patel**
