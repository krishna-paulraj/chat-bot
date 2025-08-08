# Chat Bot Backend

A Node.js backend with Express and TypeScript that provides chat functionality using Google's Gemini AI API.

## Features

- **Chat Sessions**: Create and manage persistent chat sessions
- **Message History**: Maintain conversation history within sessions
- **AI Integration**: Powered by Google's Gemini AI
- **RESTful API**: Clean REST endpoints for all operations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

3. Start the server:
```bash
npm start
```

The server will run on port 8000.

## API Endpoints

### Chat Sessions

#### Create a new chat session
```http
POST /chat/sessions
Content-Type: application/json

{
  "initialMessage": "Hello, how are you?" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "session_1234567890_abc123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastActivity": "2024-01-01T00:00:00.000Z",
    "messageCount": 2
  }
}
```

#### Get all chat sessions
```http
GET /chat/sessions
```

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "session_1234567890_abc123",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastActivity": "2024-01-01T00:00:00.000Z",
      "messageCount": 5
    }
  ]
}
```

#### Get a specific chat session
```http
GET /chat/sessions/:sessionId
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "session_1234567890_abc123",
    "history": [
      {
        "role": "user",
        "parts": [{ "text": "Hello" }]
      },
      {
        "role": "model",
        "parts": [{ "text": "Hi there! How can I help you today?" }]
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastActivity": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Send a message to a chat session
```http
POST /chat/sessions/:sessionId/messages
Content-Type: application/json

{
  "message": "What's the weather like today?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I don't have access to real-time weather data, but I can help you with other questions!",
  "session": {
    "id": "session_1234567890_abc123",
    "lastActivity": "2024-01-01T00:00:00.000Z",
    "messageCount": 4
  }
}
```

#### Delete a chat session
```http
DELETE /chat/sessions/:sessionId
```

**Response:**
```json
{
  "success": true,
  "message": "Chat session deleted successfully"
}
```

### Legacy Endpoints (for backward compatibility)

#### Simple chat (no session)
```http
POST /chat
Content-Type: application/json

{
  "message": "Hello"
}
```

## Usage Examples

### Using cURL

1. **Create a new chat session:**
```bash
curl -X POST http://localhost:8000/chat/sessions \
  -H "Content-Type: application/json" \
  -d '{"initialMessage": "Hello, I need help with programming"}'
```

2. **Send a message to an existing session:**
```bash
curl -X POST http://localhost:8000/chat/sessions/session_1234567890_abc123/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I write a function in JavaScript?"}'
```

3. **Get session history:**
```bash
curl http://localhost:8000/chat/sessions/session_1234567890_abc123
```

### Using JavaScript/Fetch

```javascript
// Create a new session
const createSession = async (initialMessage) => {
  const response = await fetch('http://localhost:8000/chat/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ initialMessage })
  });
  return response.json();
};

// Send a message
const sendMessage = async (sessionId, message) => {
  const response = await fetch(`http://localhost:8000/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message })
  });
  return response.json();
};

// Usage
const session = await createSession("Hello!");
const result = await sendMessage(session.session.id, "How are you?");
console.log(result.response);
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (for new sessions)
- `400` - Bad Request (missing parameters)
- `404` - Not Found (session not found)
- `500` - Internal Server Error

## Notes

- Chat sessions are currently stored in memory. In production, you should use a database.
- The AI model used is `gemini-1.5-flash` for optimal performance.
- Session IDs are automatically generated with timestamps for uniqueness. 