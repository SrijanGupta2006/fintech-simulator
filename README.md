# 📈 FinTech Trading Simulator

A real-time, event-driven paper trading platform built with Next.js. This application streams live market data via WebSockets, ensures atomic database transactions, and implements enterprise-grade serverless rate limiting.

## 🚀 Features

* **Live Market Feed:** Real-time stock and crypto prices streamed directly from the Finnhub API using native browser WebSockets.
* **Serverless Rate Limiting:** High-performance API route protection using Upstash Redis to prevent spam and DDoS attacks.
* **Atomic Transactions:** Secure buy/sell execution ensuring wallet balances and asset holdings are always perfectly synchronized, powered by PostgreSQL and Prisma `$transaction`.
* **Secure Authentication:** Enterprise-grade login system using NextAuth.js (Auth.js) with the Google OAuth provider and Edge runtime middleware routing.
* **Trading Ledger:** Comprehensive transaction history tracking every buy, sell, and account reset.

## 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router, Server Actions, Server Components)
* **Language:** TypeScript
* **Database:** PostgreSQL (Supabase)
* **ORM:** Prisma
* **Caching & Rate Limiting:** Upstash Redis
* **Authentication:** NextAuth.js v5 (Google Provider)
* **Live Data:** Finnhub WebSocket API
* **Styling:** Tailwind CSS

## 💻 Local Setup

### 1. Clone the repository
```bash
git clone [https://github.com/SrijanGupta2006/fintech-simulator.git](https://github.com/SrijanGupta2006/fintech-simulator.git)
cd fintech-simulator
```
### 2. Install dependencies
npm install

### 3. Environment Variables
# Database (PostgreSQL)
DATABASE_URL="your_postgres_connection_string"

# Authentication (NextAuth / Google)
AUTH_SECRET="your_random_auth_secret_string"
AUTH_GOOGLE_ID="your_google_client_id"
AUTH_GOOGLE_SECRET="your_google_client_secret"

# Real-time Market Data
NEXT_PUBLIC_FINNHUB_API_KEY="your_finnhub_api_key"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="your_upstash_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"

### 4. Database Setup
npx prisma generate
npx prisma db push

### 5. Run the Application
npm run dev

## 🧠 Architecture Highlights
* **Edge Middleware:** Protected routes are secured at the edge using a lightweight NextAuth configuration, bouncing unauthorized users before the Node.js server even spins up.
* **The Bouncer & The Bank Teller:** Traffic mitigation is handled in-memory via Redis (The Bouncer) to protect the heavy, relational PostgreSQL database (The Teller) from excessive load and database locking.
* **Singleton Connections:** Database clients (Prisma & Redis) are strictly instantiated in the /lib directory to prevent connection-pool exhaustion during local hot-reloading and serverless function executions.
