# Studentz Bangalore — Backend

Simple Express + MongoDB backend for the Studentz Bangalore frontend.

Quick start

1. Copy the example env and install dependencies:

```powershell
cd backend
npm install
cp .env.example .env    # on Windows use: copy .env.example .env
# Edit .env if you need to change MONGO_URI
npm run dev
```

2. API endpoints
- GET /api/health — health check
- POST /api/reports — create a report
  - body: { name, college, email?, category?, details }
- GET /api/reports — list reports (query: limit)

Notes
- The default connection string is `mongodb://localhost:27017/studentz-bangalore`. You can override with `MONGO_URI` in `.env`.
