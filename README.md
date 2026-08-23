<div align="center">
  <h1>🎓 CampusFind</h1>
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

## 🚀 Live Demo

**Check out the live application on Vercel:**  
🔗 **[https://campus-find-app.vercel.app](https://campus-find-app.vercel.app)**

---

## ✨ Key Features

- **⚡ Blazing Fast Search:** Instantly filter across 200+ colleges based on fees, location, ownership, and dynamic relevance algorithms.
- **📊 Side-by-Side Compare Tool:** Select up to 4 colleges to generate an un-opinionated, strict data-comparison table (Rankings, Fees, Seats, Placements).
- **🎯 Mathematical Rank Predictor:** Enter your entrance exam rank and demographic category to algorithmically filter historical cutoffs and discover statistically viable colleges.
- **📱 Premium Mobile-First UI:** Inspired by industry leaders (like Careers360), featuring compact, scannable cards, horizontal swipe categories, and massive touch targets.
- **🔒 100% Type-Safe Architecture:** The frontend React components and backend SQL queries are glued together with tRPC, ensuring zero runtime data mismatches.

---

## 🛠 Tech Stack

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

## 🏗 Architecture Overview & "How it Works"

CampusFind avoids the traditional "REST API + Swagger" bloat by utilizing a **Monolithic tRPC Architecture**. 

1. **The Request:** A user hits the search bar on the frontend. React Query triggers a tRPC hook `trpc.college.list.useQuery()`.
2. **Type Validation:** The input variables (e.g., location, fees) are intercepted and rigorously validated at runtime against a Zod schema in the backend router.
3. **Dynamic SQL:** Drizzle ORM translates the validated input into an optimized, parameterized PostgreSQL query and executes it against the Neon database.
4. **The Response:** Data is returned instantly. Because the tRPC client shares the exact return type inferred from Drizzle, the React components receive full autocomplete and compile-time checking. If the database schema changes, the frontend throws an error before the code even compiles.

---

## 📂 Folder Structure

```text
/
├── api/                  # Vercel Serverless Function entry point
├── db/                   # Database schemas (colleges, courses, reviews) & migrations
├── docs/                 # Documentation and screenshots
├── scripts/              # Utility scripts (seeders, image scrapers)
├── server/               # tRPC routers, API middleware, and DB connection logic
├── src/                  # React Frontend (Components, Pages, Hooks, Styles)
├── vercel.json           # Cloud deployment routing rules
└── package.json          # Dependency management & scripts
```

---

## ⚙️ Setup & Installation

Follow these steps to run the CampusFind application on your local machine.

### Prerequisites
- Node.js (v18+)
- A PostgreSQL Database (Local or Neon/Supabase)

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
Create a `.env` file in the root directory and add your PostgreSQL connection string:
```env
# Example Neon Serverless URL
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### 4. Push Schema & Seed Database
Use Drizzle to push the schema to your database and run the seeder script:
```bash
npm run db:push
npm run db:seed
```

### 5. Start the Development Server
```bash
npm run dev
```
*The frontend will start on `http://localhost:5173`, and the tRPC development server will boot simultaneously.*

---

## 🚀 Deployment & Infrastructure

CampusFind is deployed via a modern serverless edge architecture to guarantee high availability and minimal latency for Indian students across different regions.

- **Frontend & Edge Hosting:** Deployed on **Vercel's Edge Network**. Static assets are cached globally, ensuring near-instant page loads.
- **Serverless API:** The Node.js tRPC backend runs natively on Vercel Serverless Functions, seamlessly scaling compute resources during high traffic periods without cold-boot lag.
- **Database Connection Pooling:** Because Serverless Functions open hundreds of concurrent connections, CampusFind utilizes **Neon's PgBouncer Transaction Pooler** to safely multiplex database queries and prevent PostgreSQL connection limits from being exhausted.

---

## 🔮 Roadmap & Future Scaling

CampusFind is an actively evolving platform. As the user base grows, the architecture is designed to scale horizontally. Upcoming features and scaling initiatives include:

- **Redis Caching Layer:** Implementing Upstash Redis to aggressively cache college search queries and predictor results, reducing database reads by ~80%.
- **AI-Powered Recommendation Engine:** Integrating an embedding-based similarity search (pgvector) to recommend colleges based on multi-dimensional student profiles rather than just hard filters.
- **User Authentication & Profiles:** Allowing students to create accounts (via Clerk), save their predicted colleges, and track admission deadlines.
- **Microservices Migration:** As features expand, extracting the predictor algorithm and the data-scraping pipeline into isolated microservices.

---

<div align="center">
  <i>Built for a better educational future</i>
</div>
