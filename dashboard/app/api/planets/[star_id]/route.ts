import { NextRequest, NextResponse } from 'next/server'

const HF_API = process.env.TRINETRA_API_URL || 'https://ansul-s-trinetra-api.hf.space'

// Map planet_name → star_id for the HuggingFace API lookup
const PLANET_TO_STAR: Record<string, string> = {
  'Kepler-22b'  : 'Kepler-22',
  'Kepler-452b' : 'Kepler-452',
  'Kepler-296e' : 'Kepler-296',
  'Kepler-69c'  : 'Kepler-69',
  'Kepler-438b' : 'Kepler-438',
  'Kepler-442b' : 'Kepler-442',
  'Kepler-62f'  : 'Kepler-62',
  'Kepler-1540b': 'KIC 9388479',
  'Kepler-186f' : 'Kepler-186',
  'Kepler-1229b': 'Kepler-1229',
  'Kepler-90b'  : 'Kepler-90',
  'FP-Signal-1' : 'KIC 3544595',
  'FP-Signal-2' : 'KIC 4277632',
  'FP-Signal-3' : 'KIC 5446285',
  'FP-Signal-4' : 'KIC 6521045',
}

export async function GET(
  req: NextRequest,
  { params }: { params: { star_id: string } }
) {
  try {
    const requested = decodeURIComponent(params.star_id)

    // Resolve planet_name to star_id if needed
    const starId = PLANET_TO_STAR[requested] ?? requested

    const res  = await fetch(
      `${HF_API}/planets/${encodeURIComponent(starId)}`,
      { cache: 'no-store' }
    )
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Planet not found' },
      { status: 404 }
    )
  }
}