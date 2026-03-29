# AI Chatbot — n8n + Next.js + Groq

A lightweight AI chatbot using Next.js (frontend), n8n (backend), and Groq API (LLM).

---

## Architecture
```
Frontend (Next.js) → n8n Webhook → Groq API
```

---

## Tech Stack

| Technology | Role |
|------------|------|
| Next.js | Frontend UI |
| n8n | Backend workflow |
| Groq API | Language model |

---

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/chatbot-project.git
cd chatbot-project
```

### 2. Run Frontend
```bash
cd chat-ui
npm install
npm run dev
```

### 3. Start n8n
```bash
npx n8n
```

### 4. Configure API Key
```powershell
setx GROQ_API_KEY "your_api_key_here"
```

### 5. HTTP Node Authorization Header
```
={{ "Bearer " + $env.GROQ_API_KEY }}
```

### 6. Webhook URL
```
http://localhost:5678/webhook/chat
```

---

## Testing
```json
POST http://localhost:5678/webhook/chat

{
  "message": "Hello",
  "userId": "1"
}
```

---

## Security

- Never expose API keys in the frontend
- Add `.env` to `.gitignore`
- Always use environment variables

---

## Deployment

| Layer | Platform |
|-------|----------|
| Frontend | Vercel |
| Backend | Railway / Docker |
