# 🌌 Habit Tracker — Complete System Documentation (`fulldetails.md`)

A comprehensive architectural, technical, and design specification for the **Habit Tracker (Obsidian Fluid 3D OLED)** web application.

---

## 📑 Table of Contents
1. [Executive Summary & Design Philosophy](#1-executive-summary--design-philosophy)
2. [Technology Stack & System Dependencies](#2-technology-stack--system-dependencies)
3. [Global Design System & 3D Fluid Engine](#3-global-design-system--3d-fluid-engine)
4. [Precision Vector Icon Engine (Zero Emojis)](#4-precision-vector-icon-engine-zero-emojis)
5. [Frontend Application & Page Deep-Dive](#5-frontend-application--page-deep-dive)
6. [API Endpoints & Network Layer](#6-api-endpoints--network-layer)
7. [Database Schema & Data Models](#7-database-schema--data-models)
8. [Automated Testing & 44-Point Verification](#8-automated-testing--44-point-verification)
9. [Local Setup & Deployment Instructions](#9-local-setup--deployment-instructions)

---

## 1. Executive Summary & Design Philosophy

The application has been engineered from the ground up to solve the shortcomings of conventional habit trackers: cluttered interfaces, toy emojis, laggy navigation, and flat designs.

### Core Tenets:
- **Obsidian OLED Void Palette**: Backgrounds anchor at `#030305` and `#060709` with multi-layered atmospheric radial glows (Electric Violet, Cyber Cyan, and Emerald).
- **3D Fluid Glassmorphism**: Cards feature translucent smoked glass layers (`backdrop-blur-2xl bg-zinc-950/70`), specular top bevel highlights, and hairline metallic borders (`border-white/[0.08]`).
- **Interactive 3D Physics (`Card3D`)**: Elements dynamically respond to cursor movement with real-time perspective tilt (`rotateX`, `rotateY`) and an interactive specular radial spotlight.
- **Zero Emojis**: Complete elimination of toy emojis in favor of razor-sharp, monochromatic and category-tinted Lucide vector SVG badges.
- **Fluid Daily Cadence**: Fast daily habit execution via a 7-day horizontal carousel scrubber, real-time SVG circular progress dials, and instant optimistic status toggles.

---

## 2. Technology Stack & System Dependencies

| Component | Library / Tool | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (Turbopack) | `16.2.3` | App Router, Server Components, SSR & API routes |
| **Runtime / UI** | React & React DOM | `19.2.4` | Modern component rendering |
| **Styling** | Tailwind CSS v4 | `^4.0` | Next-gen CSS-first styling & custom `@theme` variables |
| **Primitives** | Base UI | `^1.4.0` | Accessible unstyled triggers, dialogs, & dropdowns |
| **Database** | PostgreSQL | `15+` | Relational data persistence |
| **ORM** | Prisma Client & CLI | `7.7.0` | Type-safe database queries with `@prisma/adapter-pg` |
| **Authentication** | NextAuth.js (Auth.js) | `^5.0.0-beta.31` | JWT session cookies, CSRF defense & credentials provider |
| **Charts** | Recharts | `^3.8.1` | Dark area velocity curves and bar volume telemetry |
| **Icons** | Lucide React | `^1.8.0` | Comprehensive vector icon system |
| **Forms** | React Hook Form + Zod | `^7.72` / `^4.3` | Validated, type-safe client & API data schemas |
| **Notifications** | Sonner | `^2.0.7` | High-performance toast alerts |
| **Reporting** | jsPDF | `^4.2.1` | Client/server PDF document generation |

---

## 3. Global Design System & 3D Fluid Engine

### Custom Design Tokens (`src/app/globals.css`)
```css
:root {
  --background: oklch(0.08 0.005 260); /* #060709 */
  --foreground: oklch(0.985 0 0);       /* #f4f4f7 */
  --card: oklch(0.12 0.008 260 / 70%);  /* Smoked Glass */
  --border: oklch(1 0 0 / 9%);          /* Hairline border */
  --primary: oklch(0.96 0.01 260);      /* Crisp White */
}
```

### Key Utility Classes:
- `.bg-obsidian-mesh`: Infinite fixed multi-point radial gradients simulating an atmospheric space aura.
- `.glass-panel`: 20px blur frosted smoked glass backdrop with subtle inner shadow highlight.
- `.glass-panel-glow`: Amplified glass surface with 40px outer atmospheric box-glow.
- `.preserve-3d` & `.perspective-1000`: CSS 3D rendering context for smooth physical rotations.

### 3D Perspective Card Component (`src/components/ui/card-3d.tsx`)
- Calculates mouse position relative to card center on `onMouseMove`.
- Normalizes coordinates between `-1` and `1` to apply smooth mathematical tilt angles (`rotateX` / `rotateY`).
- Injects a radial spotlight gradient matching cursor coordinates to simulate light reflecting off polished glass.
- Automatically resets rotation on `onMouseLeave` with spring dampening.

---

## 4. Precision Vector Icon Engine (Zero Emojis)

Defined in `src/components/ui/habit-icon.tsx`:
- **`ICON_MAP`**: Complete registry mapping icon keys to crisp Lucide SVG components.
- **Legacy Fallback Layer**: Existing database records containing emojis (`📚`, `💪`, `🧘`, `🏃`, `🎯`, `🧠`, `🏆`, etc.) automatically resolve to their matching Lucide vector icons (`BookOpen`, `Dumbbell`, `Brain`, `Activity`, `Target`, `Trophy`, etc.).
- **Curated Categorization**:
  - **Mind**: `Brain` (Mindfulness), `BookOpen` (Reading), `Sparkles` (Creativity), `Compass` (Focus)
  - **Fitness**: `Dumbbell` (Strength), `Activity` (Running), `Footprints` (Walking), `Bike` (Cycling)
  - **Health**: `Droplets` (Hydration), `Apple` (Nutrition), `Moon` (Sleep), `Heart` (Cardio)
  - **Productivity**: `Code` (Programming), `Target` (Deep Work), `PenTool` (Journaling), `Clock` (Routine)
  - **Lifestyle**: `Coffee` (Break), `Flame` (Discipline), `Music` (Music), `Leaf` (Growth), `Shield` (Sobriety), `Zap` (Energy)

---

## 5. Frontend Application & Page Deep-Dive

### 5.1 Landing Page (`/` — `src/app/page.tsx`)
- High-impact dark hero with tight typographic tracking.
- Floating 3D live protocol status card preview demonstrating real-time completion states.
- 3-column feature grid (`Unbroken Momentum`, `Dark Surface Analytics`, `Zero-Friction Engine`).
- Redirects authenticated users directly to `/dashboard`.

### 5.2 Header Capsule (`src/components/layout/header.tsx`)
- Floating frosted glass capsule (`sticky top-2 z-50`).
- Gradient neon brand emblem (`Zap` icon with violet glow).
- Active navigation indicator pills with inset highlights.
- Hydration-safe dark/light mode toggle.
- User profile dropdown with one-click signout.

### 5.3 Daily Execution Dashboard (`/dashboard` — `src/app/dashboard/dashboard-client.tsx`)
- **7-Day Date Scrubber Carousel**: Horizontal sliding window allowing rapid day-by-day navigation with active day pills and today indicators.
- **3D Circular Progress Dial**: SVG animated meter calculating daily percentage (`circumference * (1 - rate / 100)`) with glowing drop-shadow.
- **Discipline Anchor**: Clean daily philosophical focus quote banner.
- **Habit Action Cards**: 3D hover physics, category badge tints, streak badge (`Flame` icon), and one-click completion buttons.

### 5.4 Habit Management Hub (`/habits` — `src/app/habits/habits-client.tsx`)
- Categorized protocol overview with horizontal category filter pills.
- Active vs. Archived protocol separation.
- Quick action menu: Edit, Archive, Unarchive, and Permanent Delete with modal safety confirmation.

### 5.5 Habit Creation & Edit Form (`/habits/new`, `/habits/[id]/edit` — `src/app/habits/habit-form.tsx`)
- Replaces raw emoji inputs with a categorized vector glyph picker.
- Segmented frequency controls: `Daily`, `Weekly` (day-of-week pills), `Monthly` (calendar date grid).
- Real-time icon preview and validation via Zod.

### 5.6 Habit Deep Detail (`/habits/[id]` — `src/app/habits/[id]/habit-detail-client.tsx`)
- 4-card 3D telemetry display: Current Streak, Longest Streak, Total Completions, 30-Day Consistency Rate.
- 365-day Activity Heatmap with interactive date inspection.
- Chronological completion history log with star ratings and reflection notes.

### 5.7 Completion Logging Modal (`/habits/[id]/complete` — `src/app/habits/[id]/complete/page.tsx`)
- Interactive 5-star execution rating with hover scaling and amber glow.
- Session reflection textarea for capturing insights and notes.

### 5.8 Performance Analytics (`/stats` — `src/app/stats/stats-client.tsx`)
- Immediate "Chains at Risk" warning card for pending streaks.
- 30-day daily volume bar charts with dark glass tooltips.
- 30-day execution velocity area curve with emerald gradient fills.
- Top habit rankings by total completions.

### 5.9 System Milestones (`/achievements` — `src/app/achievements/achievements-client.tsx`)
- Titanium/obsidian milestone shields.
- Dynamic requirement progress bars (`progressCurrent / progressTarget`).
- Verified unlock timestamps.

### 5.10 System Settings (`/settings` — `src/app/settings/settings-client.tsx`)
- Profile credential inspection.
- Atmosphere toggle: `Obsidian Dark` vs. `Studio Light`.
- Timezone and week-start selection.
- Data export center: Instant CSV dataset download and PDF report generation.

---

## 6. API Endpoints & Network Layer

All protected endpoints enforce session verification via `auth()`. Unauthenticated requests receive `401 Unauthorized`.

| Endpoint | Method | Description | Request Body / Query | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/signup` | `POST` | User registration | `{ name, email, password }` | 201, 400, 500 |
| `/api/auth/[...nextauth]` | `GET/POST`| NextAuth handler | Credentials / OAuth | 200, 302 |
| `/api/profile` | `GET` | Retrieve user profile | None | 200, 401 |
| `/api/profile` | `PUT` | Update profile preferences | `{ timezone, weekStartDay, quotesEnabled, name }` | 200, 400, 401 |
| `/api/habits` | `GET` | List user habits | None | 200, 401 |
| `/api/habits` | `POST` | Create new habit | `{ name, icon, frequencyType, frequencyConfig, categoryId }` | 201, 400, 401 |
| `/api/habits/[id]` | `GET` | Fetch single habit | `id` (path param) | 200, 401, 404 |
| `/api/habits/[id]` | `PUT` | Update habit | `{ name, icon, frequencyType, frequencyConfig, categoryId }` | 200, 400, 401, 404 |
| `/api/habits/[id]` | `PATCH`| Toggle archive state | `{ isArchived: boolean }` | 200, 401, 404 |
| `/api/habits/[id]` | `DELETE`| Delete habit & cascade | `id` (path param) | 200, 401, 404 |
| `/api/habits/[id]/complete` | `POST` | Log completion | `{ completedAt?, note?, rating? }` | 201, 400, 401, 404 |
| `/api/habits/[id]/complete` | `DELETE` | Remove completion | `completionId?` (query) | 200, 401, 404 |
| `/api/export/csv` | `GET` | Stream CSV dataset | `habits?`, `start?`, `end?` | 200 (text/csv), 401 |
| `/api/export/pdf` | `GET` | Generate PDF report | `habit_id?` | 200 (application/pdf), 401 |
| `/api/export/image` | `GET` | Export instructions | None | 200 (application/json), 401 |

---

## 7. Database Schema & Data Models

Defined in `prisma/schema.prisma` with PostgreSQL adapter:

```mermaid
erDiagram
    User ||--o{ Habit : owns
    User ||--o{ Completion : logs
    User ||--o| Profile : has
    User ||--o{ UserAchievement : earns
    Category ||--o{ Habit : groups
    Habit ||--o{ Completion : records
    Achievement ||--o{ UserAchievement : defines

    User {
        string id PK
        string email UK
        string name
        string passwordHash
        datetime createdAt
    }

    Habit {
        string id PK
        string userId FK
        string name
        string icon
        string frequencyType
        json frequencyConfig
        string categoryId FK
        boolean isArchived
        int order
        datetime createdAt
    }

    Completion {
        string id PK
        string habitId FK
        string userId FK
        datetime completedAt
        string note
        int rating
        datetime createdAt
    }

    Profile {
        string id PK
        string userId FK
        string timezone
        int weekStartDay
        boolean quotesEnabled
    }

    Achievement {
        string id PK
        string name
        string description
        string icon
        string criteriaType
        int criteriaValue
    }
```

---

## 8. Automated Testing & 44-Point Verification

The test harness (`scripts/verify-all-endpoints.ts`) performs full programmatic verification against a running instance:

```bash
npx tsx scripts/verify-all-endpoints.ts
```

### Coverage Matrix:
- **Public Routes (3 checks)**: Landing page (`/`), Login (`/login`), Signup (`/signup`).
- **Route Protection (12 checks)**: Redirects unauthenticated users to `/login`; rejects unauthenticated API calls with `401`.
- **Authentication Lifecycle (4 checks)**: Rejection of malformed signup payloads, unique user creation, duplicate prevention, and CSRF credential authentication.
- **Core APIs (13 checks)**: Profile read/update, Daily habit creation, Monthly habit creation with complex date arrays, List habits, Fetch habit, Update habit, Archive habit, Complete habit, Prevent same-day duplicates, Delete completion, Delete habit, Verify 404.
- **Export Formats (3 checks)**: Content-Type and payload validation for CSV, PDF, and image instructions.
- **UI SSR Rendering (9 checks)**: Verified 200 status code and Header shell presence across Dashboard, Habits, New, Detail, Edit, Complete, Stats, Achievements, and Settings.

**Final Score**: `44 PASSED, 0 FAILED`.

---

## 9. Local Setup & Deployment Instructions

### Clone & Install
```bash
git clone https://github.com/RohithBheemini/habit-tracker-obsidianOLED.git
cd habit-tracker-obsidianOLED
npm install
```

### Environment Setup
Create a `.env` file based on `.env.example`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/habit_tracker"
AUTH_SECRET="your-32-byte-base64-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Initialization
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### Production Build & Dev Run
```bash
npm run build   # Verifies static optimization & TypeScript types
npm run dev     # Runs local server on http://localhost:3000
```
