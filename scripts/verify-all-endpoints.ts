import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma"
import * as dotenv from "dotenv"

dotenv.config()

const BASE_URL = "http://localhost:3000"

async function main() {
  console.log("==========================================================")
  console.log("       STARTING FULL ENDPOINT VERIFICATION SUITE          ")
  console.log("==========================================================")

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  // Ensure default themes and achievements exist in DB
  const themesCount = await prisma.theme.count()
  if (themesCount === 0) {
    console.log("ℹ Seeding default Indigo theme...")
    await prisma.theme.create({
      data: {
        id: "indigo",
        name: "Indigo",
        colors: { primary: "#6366f1" },
        isPreset: true,
      },
    })
  }

  const achievementsCount = await prisma.achievement.count()
  if (achievementsCount === 0) {
    console.log("ℹ Seeding default First Step achievement...")
    await prisma.achievement.create({
      data: {
        id: "first-step",
        name: "First Step",
        description: "Complete your first habit",
        criteriaType: "TOTAL",
        criteriaValue: 1,
        xpReward: 10,
      },
    })
  }

  const testEmail = `test_runner_${Date.now()}@example.com`
  const testPassword = "Password123!"
  const testName = "Endpoint Tester"

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`)
      passed++
    } else {
      console.error(`  ❌ [FAIL] ${testName}${details ? ` - ${details}` : ""}`)
      failed++
    }
  }

  // ----------------------------------------------------
  // 1. PUBLIC ROUTES (Unauthenticated)
  // ----------------------------------------------------
  console.log("\n--- 1. Testing Public & Static Routes ---")

  {
    const res = await fetch(`${BASE_URL}/`)
    assert(res.status === 200, "GET / (Landing page)", `Got status ${res.status}`)
  }
  {
    const res = await fetch(`${BASE_URL}/login`)
    assert(res.status === 200, "GET /login (Login page)", `Got status ${res.status}`)
  }
  {
    const res = await fetch(`${BASE_URL}/signup`)
    assert(res.status === 200, "GET /signup (Signup page)", `Got status ${res.status}`)
  }

  // ----------------------------------------------------
  // 2. UNAUTHENTICATED PROTECTION CHECKS
  // ----------------------------------------------------
  console.log("\n--- 2. Testing Unauthenticated Route Protection ---")

  const protectedPages = [
    "/dashboard",
    "/habits",
    "/habits/new",
    "/stats",
    "/achievements",
    "/settings",
  ]

  for (const page of protectedPages) {
    const res = await fetch(`${BASE_URL}${page}`, { redirect: "manual" })
    const isRedirect = res.status === 307 || res.status === 302
    const location = res.headers.get("location") || ""
    assert(
      isRedirect && location.includes("/login"),
      `GET ${page} redirects unauthenticated user to /login`,
      `Status: ${res.status}, Location: ${location}`
    )
  }

  const protectedApis = [
    { method: "GET", url: "/api/profile" },
    { method: "GET", url: "/api/habits" },
    { method: "POST", url: "/api/habits" },
    { method: "GET", url: "/api/export/csv" },
    { method: "GET", url: "/api/export/pdf" },
    { method: "GET", url: "/api/export/image" },
  ]

  for (const api of protectedApis) {
    const res = await fetch(`${BASE_URL}${api.url}`, { method: api.method })
    assert(res.status === 401, `${api.method} ${api.url} returns 401 Unauthorized`, `Got status ${res.status}`)
  }

  // ----------------------------------------------------
  // 3. AUTHENTICATION & SIGNUP API
  // ----------------------------------------------------
  console.log("\n--- 3. Testing Signup & Auth API ---")

  {
    // Invalid signup payload (short password)
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "A", email: "invalid-email", password: "123" }),
    })
    assert(res.status === 400, "POST /api/auth/signup rejects invalid input (400)", `Got status ${res.status}`)
  }

  {
    // Valid signup
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: testName, email: testEmail, password: testPassword }),
    })
    const data = await res.json()
    assert(res.status === 201 && data.user?.email === testEmail, "POST /api/auth/signup creates new user (201)", `Got status ${res.status}`)
  }

  {
    // Duplicate signup
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: testName, email: testEmail, password: testPassword }),
    })
    assert(res.status === 400, "POST /api/auth/signup prevents duplicate email (400)", `Got status ${res.status}`)
  }

  // ----------------------------------------------------
  // 4. NEXTAUTH LOGIN FLOW (Session Acquisition)
  // ----------------------------------------------------
  console.log("\n--- 4. Authenticating with NextAuth ---")

  let cookieHeader = ""
  {
    // 1. Get CSRF token
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`)
    const csrfData = await csrfRes.json()
    const csrfToken = csrfData.csrfToken
    const csrfCookies = csrfRes.headers.getSetCookie?.() || [csrfRes.headers.get("set-cookie") || ""]
    const parsedCookies = csrfCookies.map(c => c.split(";")[0]).join("; ")

    // 2. Perform credentials signin
    const signinRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: parsedCookies,
      },
      body: new URLSearchParams({
        email: testEmail,
        password: testPassword,
        csrfToken,
        json: "true",
      }),
      redirect: "manual",
    })

    const signinCookies = signinRes.headers.getSetCookie?.() || [signinRes.headers.get("set-cookie") || ""]
    const allCookies = [...csrfCookies, ...signinCookies].map(c => c.split(";")[0]).filter(Boolean)
    cookieHeader = Array.from(new Set(allCookies)).join("; ")

    assert(cookieHeader.includes("authjs.session-token"), "NextAuth credentials signin sets session cookie", `Cookies: ${cookieHeader.slice(0, 80)}...`)
  }

  // ----------------------------------------------------
  // 5. AUTHENTICATED API ENDPOINTS
  // ----------------------------------------------------
  console.log("\n--- 5. Testing Authenticated APIs ---")

  // Profile API
  {
    const res = await fetch(`${BASE_URL}/api/profile`, {
      headers: { Cookie: cookieHeader },
    })
    const data = await res.json()
    assert(res.status === 200 && data.profile, "GET /api/profile returns profile", `Status: ${res.status}`)
  }

  {
    const res = await fetch(`${BASE_URL}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({ timezone: "America/New_York", quotesEnabled: false }),
    })
    const data = await res.json()
    assert(
      res.status === 200 && data.profile?.timezone === "America/New_York" && data.profile?.quotesEnabled === false,
      "PUT /api/profile updates timezone and quotes preference",
      `Status: ${res.status}`
    )
  }

  // Habit APIs
  let habitId = ""
  let monthlyHabitId = ""

  {
    // Create Daily habit
    const res = await fetch(`${BASE_URL}/api/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({
        name: "Morning Walk",
        icon: "🚶",
        frequencyType: "daily",
        frequencyConfig: {},
      }),
    })
    const data = await res.json()
    habitId = data.habit?.id
    assert(res.status === 201 && habitId, "POST /api/habits creates daily habit", `Status: ${res.status}`)
  }

  {
    // Create Monthly habit with specific dates
    const res = await fetch(`${BASE_URL}/api/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({
        name: "Monthly Review",
        icon: "📅",
        frequencyType: "monthly",
        frequencyConfig: { days: [1, 15, 28] },
      }),
    })
    const data = await res.json()
    monthlyHabitId = data.habit?.id
    assert(res.status === 201 && monthlyHabitId, "POST /api/habits creates monthly habit with days [1, 15, 28]", `Status: ${res.status}`)
  }

  {
    // List habits
    const res = await fetch(`${BASE_URL}/api/habits`, {
      headers: { Cookie: cookieHeader },
    })
    const data = await res.json()
    assert(
      res.status === 200 && Array.isArray(data.habits) && data.habits.length === 2,
      "GET /api/habits lists user habits (2 items)",
      `Count: ${data.habits?.length}`
    )
  }

  {
    // Get single habit
    const res = await fetch(`${BASE_URL}/api/habits/${habitId}`, {
      headers: { Cookie: cookieHeader },
    })
    const data = await res.json()
    assert(res.status === 200 && data.habit?.id === habitId, "GET /api/habits/[id] returns habit details", `Status: ${res.status}`)
  }

  {
    // Update habit (PUT)
    const res = await fetch(`${BASE_URL}/api/habits/${habitId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({
        name: "Morning Brisk Walk",
        icon: "🏃",
      }),
    })
    const data = await res.json()
    assert(
      res.status === 200 && data.habit?.name === "Morning Brisk Walk",
      "PUT /api/habits/[id] updates habit name and icon",
      `Status: ${res.status}`
    )
  }

  {
    // Archive habit (PATCH)
    const res = await fetch(`${BASE_URL}/api/habits/${monthlyHabitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({ isArchived: true }),
    })
    const data = await res.json()
    assert(res.status === 200 && data.habit?.isArchived === true, "PATCH /api/habits/[id] archives habit", `Status: ${res.status}`)
  }

  {
    // Complete habit (POST /complete)
    const today = new Date().toISOString().split("T")[0]
    const res = await fetch(`${BASE_URL}/api/habits/${habitId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({
        completedAt: today,
        rating: 5,
        note: "Great energetic walk!",
      }),
    })
    const data = await res.json()
    assert(
      res.status === 201 && data.completion?.rating === 5,
      "POST /api/habits/[id]/complete marks habit complete with rating & note",
      `Status: ${res.status}`
    )
  }

  {
    // Attempt duplicate completion on same day
    const today = new Date().toISOString().split("T")[0]
    const res = await fetch(`${BASE_URL}/api/habits/${habitId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({
        completedAt: today,
      }),
    })
    assert(res.status === 400, "POST /api/habits/[id]/complete rejects duplicate same-day completion", `Status: ${res.status}`)
  }

  // Export APIs
  {
    const res = await fetch(`${BASE_URL}/api/export/csv`, {
      headers: { Cookie: cookieHeader },
    })
    const text = await res.text()
    assert(
      res.status === 200 && res.headers.get("content-type")?.includes("text/csv") && text.includes("Morning Brisk Walk"),
      "GET /api/export/csv exports CSV file with habit completion data",
      `Status: ${res.status}`
    )
  }

  {
    const res = await fetch(`${BASE_URL}/api/export/pdf`, {
      headers: { Cookie: cookieHeader },
    })
    assert(
      res.status === 200 && res.headers.get("content-type")?.includes("application/pdf"),
      "GET /api/export/pdf exports PDF document",
      `Status: ${res.status}`
    )
  }

  {
    const res = await fetch(`${BASE_URL}/api/export/image`, {
      headers: { Cookie: cookieHeader },
    })
    const data = await res.json()
    assert(res.status === 200 && data.message, "GET /api/export/image returns image instructions", `Status: ${res.status}`)
  }

  // ----------------------------------------------------
  // 6. AUTHENTICATED PAGES (UI SSR Rendering)
  // ----------------------------------------------------
  console.log("\n--- 6. Testing Authenticated UI Pages (SSR / Render) ---")

  const authenticatedPages = [
    { name: "Dashboard", url: "/dashboard" },
    { name: "Habits List", url: "/habits" },
    { name: "New Habit Form", url: "/habits/new" },
    { name: "Habit Details", url: `/habits/${habitId}` },
    { name: "Habit Edit", url: `/habits/${habitId}/edit` },
    { name: "Habit Complete", url: `/habits/${habitId}/complete` },
    { name: "Statistics", url: "/stats" },
    { name: "Achievements", url: "/achievements" },
    { name: "Settings", url: "/settings" },
  ]

  for (const page of authenticatedPages) {
    const res = await fetch(`${BASE_URL}${page.url}`, {
      headers: { Cookie: cookieHeader },
    })
    const html = await res.text()
    const isOk = res.status === 200
    const hasHeader = html.includes("HabitTracker")
    assert(
      isOk && hasHeader,
      `GET ${page.url} (${page.name}) renders successfully with Header`,
      `Status: ${res.status}`
    )
  }

  // ----------------------------------------------------
  // 7. CLEANUP / DELETION APIS
  // ----------------------------------------------------
  console.log("\n--- 7. Testing Deletion APIs ---")

  {
    // Delete completion
    const res = await fetch(`${BASE_URL}/api/habits/${habitId}/complete`, {
      method: "DELETE",
      headers: { Cookie: cookieHeader },
    })
    assert(res.status === 200, "DELETE /api/habits/[id]/complete removes completion", `Status: ${res.status}`)
  }

  {
    // Delete habit
    const res = await fetch(`${BASE_URL}/api/habits/${habitId}`, {
      method: "DELETE",
      headers: { Cookie: cookieHeader },
    })
    assert(res.status === 200, "DELETE /api/habits/[id] deletes habit", `Status: ${res.status}`)
  }

  {
    // Verify deleted habit returns 404
    const res = await fetch(`${BASE_URL}/api/habits/${habitId}`, {
      headers: { Cookie: cookieHeader },
    })
    assert(res.status === 404, "GET /api/habits/[id] returns 404 for deleted habit", `Status: ${res.status}`)
  }

  await prisma.$disconnect()
  await pool.end()

  console.log("\n==========================================================")
  console.log(`VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`)
  console.log("==========================================================")

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("FATAL ERROR IN TEST SUITE:", err)
  process.exit(1)
})
