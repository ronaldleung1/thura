# API Spending Control

**Add any API to Claude, track spending, enforce budgets - all in a simple dashboard**

## Quick Start

### 1. Set up Vercel Postgres

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Create a new Postgres database (Storage → Create Database → Postgres)
3. Copy all the connection strings to `.env.local`

### 2. Add your Anthropic API key

Add this to `.env.local`:
```
ANTHROPIC_API_KEY=your-key-here
```

### 3. Push the database schema

```bash
npm run db:push
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Flow

### Add a test API (Mapbox Geocoding)

1. Fill in the form:
   - **Name:** Mapbox Geocoding
   - **Endpoint:** `https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json?access_token={apiKey}`
   - **API Key:** `pk_xxxxx` (your Mapbox key)
   - **HTTP Method:** GET
   - **Cost per Call:** 0.0005
   - **Budget Limit:** 5.00
   - **Parameter Schema:** `{"query": "string"}`
   - **Description:** Get lat/long coordinates for an address

2. Click "Add API"

### Test with Claude

Ask Claude: "Find coordinates for San Francisco, New York, and Tokyo"

Watch:
- Claude calls Mapbox 3 times
- Budget tracker updates: $0.0015 / $5.00
- Results appear in chat

### Test budget enforcement

Ask: "Now do 10,000 more geocoding calls"

Claude will hit the budget limit and get a 429 error after ~9,997 calls.

## How It Works

1. **Add any API** - Paste endpoint, API key, set budget
2. **Claude gets access** - APIs automatically become tools
3. **Budget is enforced** - Proxy blocks calls when budget exceeded
4. **Track spending** - See real-time spend for each API

## Tech Stack

- **Next.js 14** (App Router)
- **Vercel Postgres** (Database)
- **Drizzle ORM** (Type-safe DB queries)
- **Anthropic SDK** (Claude integration)
- **Tailwind CSS** (Styling)

## API Routes

- `POST /api/user-apis` - Add new API
- `GET /api/user-apis` - List all APIs
- `DELETE /api/user-apis?id=xxx` - Delete API
- `POST /api/proxy` - Universal proxy with budget enforcement
- `POST /api/chat` - Chat with Claude (auto-loads tools from DB)

## Production Roadmap

- [ ] Encrypt API keys in database
- [ ] Add rate limiting per API
- [ ] Call logs and analytics
- [ ] Multi-user auth
- [ ] API marketplace (share configs)
- [ ] Webhooks for budget alerts
- [ ] Support for query params, headers, auth types
