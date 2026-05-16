import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  if (!title) return NextResponse.json({ url: null })

  try {
    const r = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`,
      { headers: { 'User-Agent': 'WanderfamApp/1.0' } }
    )
    const d = await r.json()
    const url = d.thumbnail?.source?.replace(/\/\d+px-/, '/800px-') ?? null
    return NextResponse.json({ url })
  } catch {
    return NextResponse.json({ url: null })
  }
}
