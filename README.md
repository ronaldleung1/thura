# Thura - AI API Spending Control

> **Give Claude access to any API with automatic budget enforcement and real-time spending tracking**

## Project Overview

Thura solves a critical problem: **developers want to give AI agents access to expensive third-party APIs (like Mapbox, Twilio, Remove.bg, and specialized domain APIs) but can't safely experiment because there's no budget control.**

With Thura, you can:
1. Add any external API in seconds (just paste the endpoint and your API key)
2. Set a budget limit (e.g., $5.00)
3. Chat with Claude, which automatically gets access to your APIs as tools
4. Watch spending tracked in real-time with progress bars
5. Get automatic budget enforcement (calls are blocked when limit is reached)

**The key insight:** Every API you add becomes a Claude tool automatically. No code required. Just configuration.

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- A Vercel account (free tier works)
- An Anthropic API key ([get one here](https://console.anthropic.com/))
- API keys for any services you want to test (e.g., Mapbox, OpenWeather, etc.)

### Setup Steps

1. **Clone and install dependencies:**
```bash
git clone https://github.com/yourusername/thura2.git
cd thura2
npm install
```

2. **Set up Vercel Postgres database:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **Storage** → **Create Database** → **Postgres**
   - Copy all connection strings from the `.env.local` tab

3. **Create `.env.local` file in project root:**
```env
# Vercel Postgres (copy from Vercel dashboard)
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NO_SSL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...

# Anthropic API Key
ANTHROPIC_API_KEY=sk-ant-api03-...
```

4. **Initialize the database:**
```bash
npm run db:push
```

5. **Run the app:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see Thura!

## Usage Guide

### Adding Your First API

Let's add **Mapbox Geocoding** as an example:

1. Click **"Manage APIs"** from the dashboard
2. Fill in the form:
   - **API Name:** `Mapbox Geocoding`
   - **Endpoint URL:** `https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json?access_token={apiKey}`
   - **API Key:** Your Mapbox token (e.g., `pk.eyJ1...`)
   - **HTTP Method:** `GET`
   - **Cost per Call:** `0.0005`
   - **Budget Limit:** `5.00`
   - **Parameter Schema:** `{"query": "string"}`
   - **Description:** `Get latitude/longitude coordinates for an address`
3. Click **"Add API"**

### Using Claude with Your APIs

1. Go back to the main chat page
2. Ask Claude: *"Find coordinates for San Francisco, New York, and Tokyo"*
3. Watch the magic:
   - Claude calls your Mapbox API 3 times
   - Results appear in chat
   - Spend tracker updates accordingly

### Example APIs to Try

**OpenWeather API:**
- Endpoint: `https://api.openweathermap.org/data/2.5/weather?q={city}&appid={apiKey}`
- Method: `GET`
- Params: `{"city": "string"}`

**Remove.bg (Background Removal):**
- Endpoint: `https://api.remove.bg/v1.0/removebg`
- Method: `POST`
- Params: `{"image_url": "string"}`

**Your Custom APIs:**
- Works with any REST API!

## Tech Stack

- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vercel Postgres** (Neon) - Database
- **Drizzle ORM** - Type-safe database queries
- **Anthropic SDK** - Claude AI integration

## Claude API Integration

Thura uses **Claude's tool use (function calling)** to dynamically convert user APIs into callable tools. Here's how it works:

1. **Dynamic Tool Generation**: When you chat with Claude, we fetch all your APIs from the database and convert them into Claude tool definitions on-the-fly
2. **Universal Proxy**: When Claude calls a tool, we route it through our proxy which checks budgets, calls the external API, tracks spending, and returns results
3. **Budget Enforcement**: Before each external API call, the proxy validates that `currentSpend + costPerCall <= budgetLimit`. If exceeded, returns a 429 error
4. **Atomic Tracking**: Spend is tracked using SQL atomic operations to prevent race conditions

**Why this works:** APIs are stored in the database, not hardcoded. Claude gets updated tools on every request. One proxy layer enforces all budget limits. Zero configuration needed.

## Challenges & Solutions

**Dynamic Tool Schema Conversion**: Claude requires strict JSON Schema format, but users provide simple parameter schemas. We normalize user input (e.g., `{"query": "string"}`) into proper tool definitions automatically.

**Universal Proxy Pattern**: Different APIs use different patterns (query params vs. body, API key in URL vs. headers). We support template-based URL interpolation for GET requests and JSON body + Bearer auth for POST requests.

**Atomic Spend Tracking**: Multiple concurrent requests could cause race conditions. We use SQL atomic operations to safely increment spending.

**Tool Response Parsing**: Claude returns complex response objects with multiple content blocks. We filter by content type to extract tool calls and text responses separately.

## Future Plans

**Automatic API Discovery** (the big vision): Instead of manually filling out a form, users would just say "I want to use the Mapbox Geocoding API" and paste their API key. An agent with web access would search for API documentation, extract endpoint patterns and pricing, and auto-configure everything. User just confirms and it's ready.

**OpenAPI/Swagger Import**: Upload an OpenAPI spec file and auto-generate all endpoints as tools in one click.

**API Marketplace**: Users share pre-configured API templates. One-click add for popular APIs like Twilio, Stripe, etc.

**Industry-Specific Bundles**: Enable professionals in legal, healthcare, finance, real estate, and engineering to safely use specialized APIs (LexisNexis, Epic FHIR, Bloomberg Terminal, etc.) in AI workflows. These fields have expensive APIs that current AI agents can't safely access - Thura would enable safe experimentation.

**Enhanced Security**: Encrypt API keys at rest, per-API rate limiting, webhook alerts at 80% budget, audit logs.

**Analytics Dashboard**: Call logs with timestamps/params/responses, cost breakdown by API and conversation, CSV export.

**Multi-User Auth**: Team workspaces, role-based access, shared API pools.

## License

MIT License
