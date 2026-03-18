import { NextRequest, NextResponse } from 'next/server'

const HF_API = process.env.TRINETRA_API_URL || 'https://ansul-s-trinetra-api.hf.space'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const top       = searchParams.get('top')
    const tier      = searchParams.get('tier')
    const starId    = searchParams.get('id')
    const validated = searchParams.get('validated')

    let url: string

    if (starId)         url = `${HF_API}/planets/${encodeURIComponent(starId)}`
    else if (top)       url = `${HF_API}/planets/top/${top}`
    else if (validated) url = `${HF_API}/planets/validated`
    else if (tier)      url = `${HF_API}/habitability/earthlike`
    else                url = `${HF_API}/planets`

    const res  = await fetch(url, { next: { revalidate: 60 } })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch planets' },
      { status: 500 }
    )
  }
}