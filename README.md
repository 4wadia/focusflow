<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FocusFlow Kanban

A modern, productivity-focused Kanban task management app built with React, TypeScript, Elysia, and MongoDB.

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, Vite
- **Backend**: Elysia (Bun-native), MongoDB, Mongoose
- **Auth**: Google OAuth 2.0, JWT

## Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- [MongoDB](https://www.mongodb.com/try/download/community) (local or Atlas)
- Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

## Setup

### 1. Install Dependencies
```bash
bun install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI` - Your MongoDB connection string
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `JWT_SECRET` - A secure random string

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000/auth/google/callback` to authorized redirect URIs
4. Copy Client ID and Secret to `.env`

## Running the App

### Development (both frontend + backend)
```bash
# Terminal 1: Start backend (port 3000)
bun run dev:server

# Terminal 2: Start frontend (port 5173)
bun run dev
```

### Production Build
```bash
bun run build
bun run preview
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/google` | GET | Start Google OAuth |
| `/auth/me` | GET | Get current user |
| `/api/tasks` | GET/POST | List/Create tasks |
| `/api/tasks/:id` | GET/PUT/DELETE | Single task operations |
| `/api/columns` | GET/POST | List/Create columns |
| `/api/columns/:id` | GET/PUT/DELETE | Single column operations |
| `/api/users/profile` | GET/PUT | User profile |
| `/api/users/stats` | GET | User statistics |

## Project Structure

```
focusflow-kanban/
├── server/              # Backend (Elysia)
│   ├── index.ts         # Server entry
│   ├── config/db.ts     # MongoDB connection
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   └── utils/           # JWT helpers
├── components/          # React components
├── App.tsx              # Main React app
└── index.html           # Entry HTML
```

## License

MIT

