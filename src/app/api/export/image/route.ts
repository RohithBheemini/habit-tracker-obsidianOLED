import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({
      message: "Image export is handled client-side using html2canvas",
      instructions: "Use html2canvas in the client to capture the dashboard element",
    })
  } catch (error) {
    console.error("GET /api/export/image error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
