import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("content")
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error searching content:", error)
    return NextResponse.json({ error: "Failed to search content" }, { status: 500 })
  }

  return NextResponse.json({ results: data || [] })
}
