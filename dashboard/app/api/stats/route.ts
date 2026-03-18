import { NextResponse } from 'next/server'

const HF_API = process.env.TRINETRA_API_URL || 'https://ansul-s-trinetra-api.hf.space'

export async function GET() {
  try {
    const res  = await fetch(`${HF_API}/stats`, { next: { revalidate: 60 } })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}
