import { NextRequest, NextResponse } from 'next/server'

const HF_API = process.env.TRINETRA_API_URL || 'https://ansul-s-trinetra-api.hf.space'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res  = await fetch(`${HF_API}/score`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ success: false, error: 'Scoring failed' }, { status: 500 })
  }
}
