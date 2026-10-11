# 🌌 Habit Tracker — Obsidian Fluid OLED

> A high-performance, minimalist personal habit tracking application crafted with deep OLED black aesthetics, interactive 3D fluid glassmorphism, zero emojis, and precision telemetry analytics.

![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-black?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-black?style=for-the-badge&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-7.7-black?style=for-the-badge&logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-black?style=for-the-badge&logo=typescript)

---

## ✨ Features & Design Highlights

- 🌑 **Pure Obsidian & OLED Void Palette**: True `#030305` and `#060709` dark backgrounds with luminous Electric Violet, Emerald, and Cyan atmospheric glow backdrops.
- 📐 **3D Physics & Tilt (`Card3D`)**: Interactive cards dynamically tilt in 3D perspective (`rotateX`, `rotateY`) following cursor movement with smooth spring physics and an active specular spotlight reflection.
- 🎯 **Zero Toy Emojis — Precision Vector Engine**: Replaced all emojis with a curated Lucide SVG vector icon system (`Brain`, `Dumbbell`, `Activity`, `Target`, `BookOpen`, `Code`, `Flame`, `Sparkles`, `Droplets`, `Shield`, `Compass`, `Clock`).
- 🗓️ **7-Day Interactive Date Scrubber**: Horizontal frosted glass date carousel on the dashboard for instant historical day scrubbing and streak review.
- ⭕ **3D Circular Progress Dial**: SVG animated meter calculating real-time daily protocol completion with glowing stroke filters.
- 📊 **Performance Telemetry (`/stats`)**: Dark Recharts visualizations displaying daily execution volume, velocity curves, and a 365-day macro consistency heatmap.
- 🏆 **Titanium Milestone Shields (`/achievements`)**: Habit consistency milestones tracked with requirement progress bars and zero clutter.
- 🔒 **Hardened Authentication & Security**: Complete NextAuth integration, protected routes, and bcrypt salted hashing.
- 💾 **Data Portability**: Instant one-click exports to CSV datasets and PDF summary reports.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **UI Library** | React 19 + Base UI primitives |
| **Styling** | Tailwind CSS v4 + Glassmorphic 3D Design Tokens |
| **Icons** | Lucide React |
| **Database** | PostgreSQL via Prisma ORM 7 + `@prisma/adapter-pg` |
| **Authentication** | NextAuth.js v5 (Auth.js) |
| **Visualization** | Recharts (Dark Area & Bar Analytics) |
| **Notifications** | Sonner (Custom toasts) |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- PostgreSQL database instance

### 2. Environment Configuration
Clone the repository and copy the environment template:

```bash
git clone https://github.com/RohithBheemini/habit-tracker-obsidianOLED.git
cd habit-tracker-obsidianOLED
cp .env.example .env
```

Configure your `.env` with your PostgreSQL connection string and NextAuth secret:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/habit_tracker"
AUTH_SECRET="your-generated-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Install Dependencies & Generate Database Client
```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to experience the Obsidian Fluid 3D Habit Tracker.

---

## 🧪 Testing & Verification

Run the automated endpoint verification suite validating all 44 API, Auth, and UI endpoints:

```bash
npx tsx scripts/verify-all-endpoints.ts
```

Compile and typecheck the production build:

```bash
npm run build
```

---

## 📄 License
MIT License. Built for discipline and consistency.
