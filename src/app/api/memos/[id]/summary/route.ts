import { NextRequest, NextResponse } from 'next/server'
import { generateSummary, generateSummaryAndTags } from '@/lib/gemini'
import { supabase } from '@/lib/supabaseClient'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, generateTags } = body

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

    // 태그 생성이 요청된 경우 요약과 태그를 함께 생성
    if (generateTags) {
      const { summary, tags } = await generateSummaryAndTags(content)

      // 데이터베이스에 요약과 태그 저장
      const { error: updateError } = await supabase
        .from('memos')
        .update({ summary, tags })
        .eq('id', id)

      if (updateError) {
        console.error('Failed to save summary and tags to database:', updateError)
        // 생성은 성공했지만 DB 저장 실패 시에도 결과는 반환
      }

      return NextResponse.json({ summary, tags }, { status: 200 })
    } else {
      // 기존 동작: 요약만 생성
      const summary = await generateSummary(content)

      // 데이터베이스에 요약 저장
      const { error: updateError } = await supabase
        .from('memos')
        .update({ summary })
        .eq('id', id)

      if (updateError) {
        console.error('Failed to save summary to database:', updateError)
        // 요약 생성은 성공했지만 DB 저장 실패 시에도 요약은 반환
      }

      return NextResponse.json({ summary }, { status: 200 })
    }
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

