# WINGMAN

> **"Your journey has your back."**  
> *"The booking is a transaction. The journey is the outcome."*

Wingman is an **autonomous Journey Continuity Agent** that dynamically reasons over Journey State, executes tools, enforces invariant authority & constraint rules, and protects the outcome of a traveller's journey from planning through completion when reality changes.

---

## What Makes Wingman a Real Agent (Not a Scripted Chatbot)

1. **Structured Journey State as Single Source of Truth:**
   The entire journey—objective, destination, origin, travellers, individual constraints, commitments, bookings, dependencies, authority limits, and audit logs—lives in structured state.
2. **General Reasoning with Parameterized Tools (`src/lib/tools/`):**
   Wingman is not scripted for one demo. The wedding story is simply **seed data**. When judges or travellers submit arbitrary prompts (cancelled flights, delayed trains, lost hotel bookings, cancelled cabs, new budget limits, new accessibility constraints, or explanation queries), Wingman queries dynamic tools and reasons over state.
3. **Deterministic Invariant & Decision Layer (`src/lib/decision/`):**
   The LLM cannot override hard constraints (e.g. Meera's wheelchair assistance, group continuity, arrival deadlines) or autonomous spending authority. If an option exceeds authority, Wingman halts execution and presents an explicit human approval gate.
4. **Causal Dependency Repair:**
   When an upstream booking (e.g. flight) is broken, Wingman automatically detects invalidated downstream dependencies (e.g. airport transfer) and repairs both before declaring the journey recovered.
5. **Unified Brain for Text and Voice:**
   Text input and Gnani voice STT audio stream into the exact same `/api/agent` pipeline. If `GNANI_API_KEY` is not present, the system clearly notifies the user rather than faking browser speech.
6. **Apple-Level Minimal UI:**
   A streamlined, distraction-free interface with a clean timeline flow, a large unified *"Tell Wingman anything..."* input bar, and high-impact Hero Action Cards.

---

## Architecture

```text
                        ┌──────────────────────────────────────────────┐
                        │              User Input Stream               │
                        │  (Natural Language Text OR Gnani STT Audio)  │
                        └──────────────────────┬───────────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────────────┐
                        │          POST /api/agent (Unified)           │
                        └──────────────────────┬───────────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────────────┐
                        │             Journey State Store              │
                        │  (objective, travellers, commitments, etc.)  │
                        └──────────────────────┬───────────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────────────┐
                        │          OpenAI Tool-Calling Engine          │
                        │     (Understands intent, evaluates risk,     │
                        │        selects tools to query/repair)        │
                        └──────────────────────┬───────────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────────────┐
                        │         Deterministic Decision Engine        │
                        │    (Authority checks, deadline validation,   │
                        │     hard constraint filter, dependency repair)│
                        └──────────────────────┬───────────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────────────┐
                        │             Tool Execution Layer             │
                        │  (Travel, Ground, Hotels, Payments, Cargo)   │
                        └──────────────────────┬───────────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────────────┐
                        │           Verified State Transition          │
                        │   (Updated State, Audit Log, TTS Synthesis)  │
                        └──────────────────────────────────────────────┘
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLite or PostgreSQL connection string | `"file:./dev.db"` |
| `OPENAI_API_KEY` | OpenAI API key for reasoning agent | (Optional for demo) |
| `OPENAI_MODEL` | OpenAI Model | `gpt-6-luna` |
| `GNANI_API_KEY` | Gnani Voice API Key | (Optional for voice STT/TTS) |
| `PINE_LABS_API_KEY` | Pine Labs Gateway Key | (Optional) |
| `DELHIVERY_API_TOKEN` | Delhivery Logistics Key | (Optional) |

---

## Local Development & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database & Seed Initial Demo Journey
```bash
npx prisma db push
npm run seed
```

### 3. Run Automated Dynamic Prompt Verification Tests (Part 29)
```bash
npm test
```
*Tests 10+ arbitrary prompts: flight cancellation, 3-hour train delay, grandmother cannot travel alone, updating authority to ₹5,000, authority exceeded halt, human approval execution, hotel unavailable, cab cancelled, arrival deadline lock, and decision explanation queries.*

### 4. Run Competition Sequence Tests
```bash
npm run test:sim
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## User Flows & Screens

1. **Landing Page (`/`):**
   - High-impact minimal entry: **CREATE JOURNEY**, **JOIN JOURNEY**, or **Load Demo Journey (Goa Wedding)**.
2. **Journey Home (`/journey/[code]`):**
   - Clean Header: Journey Title + Status Pill (`MONITORING` / `RECOVERED` / `DECISION REQUIRED`).
   - Dependency Sequence Flow: `HYDERABAD` ↓ `FLIGHT` ↓ `GOA` ↓ `TRANSFER` ↓ `HOTEL` ↓ `WEDDING`.
   - Large Primary Input: *"Tell Wingman anything..."* with 🎙 Speak and ⌨ Send.
   - Hero Action Card: Disruption assessment → Wingman decision → Why → Action → Verification → Transfer Repaired → Recovered.
   - 3 clean tabs: **Journey** | **Activity** | **People**.
   - Simulation Control: Inject external facts (Flight cancelled, Flight delayed, Hotel unavailable, Cab cancelled, Train delayed, etc.).
   - Decision Required Modal: Interactive approval for authority-exceeded options.
3. **Progressive Conversational Onboarding (`/create`):**
   - Step 1: Where are you going?
   - Step 2: What's taking you there?
   - Step 3: When do you need to arrive?
   - Step 4: Who's travelling?
   - Step 5: What should Wingman protect? (Choice cards)
   - Step 6: How much can Wingman spend without asking you?
   - Finish: "Your Wingman is ready."

---

## Vercel Deployment

Wingman is 100% Vercel-compatible:

```bash
# Verify build
npm run build

# Deploy via Vercel CLI
vercel
```

For production deployments with Postgres, update `provider = "postgresql"` in `prisma/schema.prisma` and set `DATABASE_URL`.

---

## Git Commands

```bash
git init
git add .
git commit -m "feat: complete WINGMAN autonomous journey continuity agent"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```
