import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid request format. Expected array of items with id and ranking." },
        { status: 400 },
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Verify the user is authenticated and is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Update rankings in a transaction
    const updates = items.map(({ id, ranking }) => {
      return supabase.from("content").update({ ranking }).eq("id", id)
    })

    await Promise.all(updates)

    return NextResponse.json({ success: true, message: "Rankings updated successfully" })
  } catch (error) {
    console.error("Error updating content rankings:", error)
    return NextResponse.json({ error: "Failed to update content rankings" }, { status: 500 })
  }
}
