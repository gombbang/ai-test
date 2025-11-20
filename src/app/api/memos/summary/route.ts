import { NextRequest, NextResponse } from 'next/server'
import { generateSummary } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '메모 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    // 메모 내용이 비어있는 경우
    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: '요약할 내용이 없습니다.' },
        { status: 400 }
      )
    }

    // Gemini를 사용하여 요약 생성
    const summary = await generateSummary(content)

    return NextResponse.json({ summary }, { status: 200 })
  } catch (error) {
    console.error('Summary generation error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '메모 요약 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

