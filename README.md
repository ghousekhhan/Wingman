# WINGMAN

> **"Your journey has your back."**  
> *"The booking is a transaction. The journey is the outcome."*

Wingman is an **autonomous Journey Continuity Agent** that protects the outcome of a traveller's journey from planning through completion when reality changes.

---

## The Core Concept

Traditional travel platforms treat bookings as terminal transactions: a ticket is bought, an itinerary is printed, and if disruption strikes, the human traveller is left stranded navigating rebooking queues and airline helplines.

**Wingman operates differently:**
- The user declares **what matters** (the commitment, arrival deadlines, constraints, individual accessibility requirements, spending authority).
- Wingman operates continuously through the 8-stage agent loop:  
  **`UNDERSTAND` → `PLAN` → `COMMIT` → `MONITOR` → `PROTECT` → `RECOVER` → `VERIFY` → `COMPLETE`**.
- When an external disruption occurs (e.g. flight cancellation), the traveller does not tell Wingman what to book. The agent **independently determines what to do**, validates constraints, bounds spending against authorized limits, executes replacement bookings, verifies consequential downstream dependencies (like ground airport transfers), and preserves the journey outcome.

---

## The Primary Demo Story

- **Lead Traveller:** Rahul
- **Journey:** Hyderabad → Goa
- **Date:** 21 December 2026
- **Purpose / Commitment:** Attend sister's wedding (Ceremony at 7:00 PM)
- **Hard Arrival Requirement:** Everyone must reach the wedding venue before **6:00 PM**
- **Autonomous Spending Authority:** ₹10,000
- **Coordinated Travellers:**
  1. **Rahul** (Lead Traveller)
  2. **Meera** (Grandmother)
     - *Constraints:* Cannot travel alone, must remain with the group, requires wheelchair accessibility assistance
  3. **Arjun** (Family member)
  4. **Sara** (Family member)
  5. **Kabir** (Family member)
- **Group Constraint:** Everyone stays together (no split itineraries).
- **Initial Status:** `MONITORING` (Flight, Airport Transfer, Hotel, Wedding Commitment all confirmed and synchronized).

### Primary Simulation Flow:
1. External fact injected: **"Flight HYD-GOI cancelled"**.
2. Wingman loads the Journey State and evaluates 4 options returned by the Passenger Travel connector:
   - **Option A (₹6,400, Arrives 5:20 PM):** 5 seats together, accessibility confirmed, within ₹10,000 limit.
   - **Option B (₹12,500, Arrives 4:50 PM):** Exceeds autonomous authority limit (₹12,500 > ₹10,000).
   - **Option C (₹5,900, Arrives 5:10 PM):** Only 4 seats together (violates group continuity).
   - **Option D (₹4,200, Arrives 7:30 PM):** Misses 6:00 PM wedding arrival deadline.
3. Wingman independently selects **Option A**, books IndiGo 6E-891, and verifies the PNR with the GDS.
4. Wingman detects that the original airport transfer was tied to the cancelled flight and is now invalid.
5. Wingman autonomously selects and books a replacement accessible van transfer (GoaMobility Pro) synchronized with the 5:20 PM landing, and verifies fleet dispatch.
6. Journey state transitions to **`RECOVERED`**.

### Bounded Autonomy Simulation Flow:
1. High-surge disruption scenario injected.
2. Candidate options:
   - **Option A (₹14,800, Arrives 5:20 PM):** Protects wedding, but exceeds ₹10,000 authority.
   - **Option B (₹8,900, Arrives 8:15 PM):** Within budget, but misses 6:00 PM wedding deadline.
3. Wingman halts at **`DECISION REQUIRED`** and requests human decision:
   *"The only option that protects the wedding costs ₹14,800, exceeding your ₹10,000 autonomous limit."*
4. Rahul clicks **"APPROVE ₹14,800"** → Wingman executes recovery, processes payment through Pine Labs, and recovers the journey.

---

## Architecture & Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark/neutral high-density control room UI)
- **Icons:** Lucide React
- **Database:** Prisma ORM with SQLite (local zero-config dev) / PostgreSQL / Supabase compatible
- **Reasoning Engine:** OpenAI API (`OPENAI_MODEL` defaulting to `gpt-6-luna` or fallback) with an embedded deterministic evaluation engine ensuring resilience during demo presentations
- **Simulated Connectors (`src/lib/connectors/`):**
  - **Passenger Travel:** `searchRecoveryOptions()`, `bookReplacement()`, `verifyBooking()`
  - **Mobility / Ground:** `findTransfer()`, `bookTransfer()`, `verifyTransfer()`
  - **Gnani Voice AI:** `transcribe()`, `speak()` with Gnani speech adapter
  - **Pine Labs Payments:** `createPayment()`, `getPaymentStatus()` with bounded spending authority check
  - **Delhivery Logistics:** `trackShipment()`, `expediteShipment()` for wedding outfit cargo dependencies

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Prisma SQLite or PostgreSQL URL | `"file:./dev.db"` |
| `OPENAI_API_KEY` | OpenAI API key for reasoning agent | (Optional for demo) |
| `OPENAI_MODEL` | OpenAI Model | `gpt-6-luna` |
| `GNANI_API_KEY` | Gnani Voice API Key | (Optional - falls back to Gnani Demo Adapter) |
| `PINE_LABS_API_KEY` | Pine Labs API Key | (Optional - simulated gateway active) |
| `DELHIVERY_API_TOKEN` | Delhivery Express Token | (Optional - simulated logistics active) |

> **Security Note:** All API keys and secrets are strictly server-side and never exposed to client-side code.

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

### 3. Run Automated Agent Verification Tests
```bash
npm test
```
*Asserts all 23 verification criteria including constraint validation, option selection, downstream transfer chaining, and bounded authority checks.*

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Walkthrough Guide

1. **Landing Screen (`/`):**
   - Click **"Launch Primary Demo: Rahul's Goa Wedding"** or enter **"CREATE A JOURNEY"**.
2. **Journey Room (`/journey/ROOM-WING01`):**
   - Inspect the **Journey Dependency Graph** (`Flight → Airport Transfer → Hotel → Wedding`).
   - Notice current status: `MONITORING`.
   - Click **"People"** tab: Inspect Meera's non-negotiable constraints (*Cannot travel alone, Must stay with group, Accessibility assistance required*).
   - Click **"Talk to Wingman"**: Experience the Gnani Voice interaction (`LISTENING → TRANSCRIBING → UNDERSTANDING → ACTING → RESPONDING`).
3. **Trigger Primary Simulation:**
   - Click **"Simulation Control"** in the top navigation.
   - Click **"Primary Simulation: Inject Flight HYD-GOI Cancelled"**.
   - Watch the live **Action Card** update:
     - Disruption analyzed (`Sister's wedding at risk`, `5 travellers`, `Meera accessibility`).
     - Wingman evaluates 4 candidate options and chooses **Option A** (`₹6,400`, arrives `5:20 PM`).
     - Wingman executes and verifies replacement flight `IndiGo 6E-891`.
     - Wingman automatically invalidates the old airport transfer and books a new accessible van `TRF-GOA-8841` with ramp for 5:35 PM pickup.
     - Status updates to **`RECOVERED`**.
   - Check the **"Activity"** tab to see the exact chronological audit trail.
4. **Trigger Authority-Exceeded Simulation:**
   - Click **"Simulation Control"** → Click **"Reset Demo Journey State"**.
   - Click **"Authority Exceeded: High-Cost Surge Cancellation"**.
   - Notice Wingman halts execution: status becomes **`DECISION REQUIRED`**.
   - Modal appears: *"The only option that protects the wedding costs ₹14,800, exceeding your ₹10,000 autonomous limit."*
   - Click **"APPROVE ₹14,800"** → Wingman elevates spending limit, books Option A, and completes recovery.
5. **Logistics Cargo Tab:**
   - Click **"Logistics"** tab: View the Delhivery shipment of wedding outfits.
   - If marked at risk, click **"Autonomously Expedite via Air"** to protect the wedding ceremony arrival.

---

## Deployment to Vercel

Wingman is 100% Vercel-compatible:

```bash
# Production build test
npm run build

# Deploy via Vercel CLI
vercel
```

For production deployments with Postgres:
1. Connect a Supabase or Vercel Postgres instance.
2. In `prisma/schema.prisma`, change datasource provider to `postgresql` and set `DATABASE_URL`.
3. Run `npx prisma db push` or `prisma migrate deploy`.

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
