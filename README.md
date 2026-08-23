<div align="center">
  <h1>CampusFind</h1>
  <p><strong>A Modern, High-Performance College Discovery & Predictor Platform</strong></p>

  [![React](https://img.shields.io/badge/React-19.0.0-blue.svg?style=flat&logo=react)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
  [![tRPC](https://img.shields.io/badge/tRPC-11.8.1-2596be.svg?style=flat&logo=trpc)](https://trpc.io/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791.svg?style=flat&logo=postgresql)](https://neon.tech/)
  [![Vercel](https://img.shields.io/badge/Deployed-Vercel-black.svg?style=flat&logo=vercel)](https://vercel.com/)
</div>

<br/>

CampusFind is an end-to-end, type-safe full-stack web application designed to solve the fragmented college discovery process in India. By providing instantaneous search, side-by-side data comparisons, and a mathematical rank-based predictor, CampusFind empowers students to make data-driven educational decisions effortlessly.

---

## Live Demo

**Check out the live application on Vercel:**  
[https://campus-find-app.vercel.app](https://campus-find-app.vercel.app)

---

## Key Features

- **Fast Search:** Instantly filter across 200+ colleges based on fees, location, ownership, and dynamic relevance algorithms.
- **Side-by-Side Compare Tool:** Select up to 4 colleges to generate an un-opinionated, strict data-comparison table (Rankings, Fees, Seats, Placements).
- **Mathematical Rank Predictor:** Enter your entrance exam rank and demographic category to algorithmically filter historical cutoffs and discover statistically viable colleges.
- **Mobile-First UI:** Inspired by industry leaders, featuring compact, scannable cards, horizontal swipe categories, and accessible touch targets.
- **Type-Safe Architecture:** Frontend React components and backend SQL queries are typed with tRPC, ensuring zero runtime data mismatches.

---

## Tech Stack

**Frontend**
- **Framework:** React 19 + Vite
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS + Radix UI Primitives + GSAP (Animations)
- **State Management:** React Query (via `@trpc/react-query`)

**Backend & Database**
- **API Engine:** tRPC + Hono (via `@hono/node-server`)
- **Database:** PostgreSQL (Hosted on [Neon Serverless DB](https://neon.tech/))
- **ORM:** Drizzle ORM
- **Runtime:** Node.js (compiled via `esbuild`)

**Infrastructure**
- **Hosting:** Vercel (Edge Network for static files, Serverless Functions for API)
- **Connection Pooling:** Neon Transaction Pooler

---

## Architecture Overview

CampusFind avoids traditional REST API complexity by utilizing a **Monolithic tRPC Architecture**:

1. **The Request:** A user enters a query in the search bar. React Query triggers the tRPC hook `trpc.college.list.useQuery()`.
2. **Type Validation:** Input variables (e.g., location, fees) are validated at runtime against a Zod schema in the backend router.
3. **Dynamic SQL:** Drizzle ORM translates the validated input into an optimized, parameterized PostgreSQL query and executes it against the Neon database.
4. **The Response:** Data is returned with compile-time type safety. Shared types ensure full autocomplete across client and server.

---

## Project Structure

```text
/
├── api/                  # Vercel Serverless Function entry point
├── db/                   # Database schemas (colleges, courses, reviews) & migrations
├── docs/                 # Documentation
├── scripts/              # Utility scripts (seeders, image scrapers)
├── server/               # tRPC routers, API middleware, and DB connection logic
├── src/                  # React Frontend (Components, Pages, Hooks, Styles)
├── vercel.json           # Cloud deployment routing rules
└── package.json          # Dependency management & scripts
```

---

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Local or Neon/Supabase)

### 1. Clone the repository
```bash
git clone https://github.com/omdesai69/campusfind.git
cd campusfind
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### 4. Push Schema & Seed Database
```bash
npm run db:push
npm run db:seed
```

### 5. Start the Development Server
```bash
npm run dev
```
*Frontend runs on `http://localhost:5173` with tRPC backend concurrently.*

---

## Deployment & Infrastructure

- **Frontend & Edge Hosting:** Deployed on **Vercel Edge Network** with global asset caching.
- **Serverless API:** Node.js tRPC backend runs natively on Vercel Serverless Functions.
- **Database Connection Pooling:** Utilizes **Neon PgBouncer Transaction Pooler** to safely multiplex connections.

---

## Roadmap & Future Scaling

- **Redis Caching Layer:** Implement Upstash Redis to cache frequent college search queries and reduce database reads.
- **Vector Search Recommendation Engine:** Integrate pgvector for semantic similarity search on candidate student profiles.
- **User Authentication:** Integrate authentication (Clerk) for saved colleges and deadline tracking.
- **Microservices Isolation:** Extract data-scraping and predictor pipelines into dedicated microservices.

---

<div align="center">
  <i>Built for modern educational discovery</i>
</div>
