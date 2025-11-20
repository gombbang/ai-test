import { GoogleGenAI } from '@google/genai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set')
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

export interface SummaryAndTags {
  summary: string
  tags: string[]
}

export async function generateSummary(content: string): Promise<string> {
  try {
    const prompt = `다음 메모를 간결하고 명확하게 요약해주세요. 핵심 내용만 2-3문장으로 정리해주세요. 반드시 존댓말로 작성해주세요:\n\n${content}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
      config: {
        maxOutputTokens: 200,
        temperature: 0.7,
      },
    })

    return response.text || '요약을 생성할 수 없습니다.'
  } catch (error) {
    console.error('Error generating summary:', error)
    throw new Error('메모 요약 생성 중 오류가 발생했습니다.')
  }
}

export async function generateSummaryAndTags(
  content: string
): Promise<SummaryAndTags> {
  try {
    const prompt = `다음 메모를 분석하여 다음 두 가지를 제공해주세요:
1. 메모를 간결하고 명확하게 요약 (핵심 내용만 2-3문장, 존댓말)
2. 메모의 주요 주제와 내용을 반영한 태그 3-5개 (한국어, 쉼표로 구분)

응답 형식은 반드시 다음 JSON 형식으로 작성해주세요:
{
  "summary": "요약 내용",
  "tags": ["태그1", "태그2", "태그3"]
}

메모 내용:
${content}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
      config: {
        maxOutputTokens: 500,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    })

    const responseText = response.text || '{}'
    let parsed: SummaryAndTags

    try {
      parsed = JSON.parse(responseText)
    } catch {
      // JSON 파싱 실패 시 텍스트에서 추출 시도
      console.warn('Failed to parse JSON response, attempting text extraction')
      const summaryMatch = responseText.match(/summary["\s]*:["\s]*"([^"]+)"/i)
      const tagsMatch = responseText.match(/tags["\s]*:["\s]*\[([^\]]+)\]/i)

      parsed = {
        summary:
          summaryMatch?.[1] ||
          responseText.split('\n')[0] ||
          '요약을 생성할 수 없습니다.',
        tags: tagsMatch
          ? tagsMatch[1]
              .split(',')
              .map(t => t.trim().replace(/["']/g, ''))
              .filter(t => t.length > 0)
              .slice(0, 5)
          : [],
      }
    }

    // 태그가 없거나 빈 배열인 경우 기본값 설정
    if (!parsed.tags || parsed.tags.length === 0) {
      parsed.tags = ['일반']
    }

    // 태그 개수 제한 (최대 5개)
    parsed.tags = parsed.tags.slice(0, 5)

    return {
      summary: parsed.summary || '요약을 생성할 수 없습니다.',
      tags: parsed.tags || [],
    }
  } catch (error) {
    console.error('Error generating summary and tags:', error)
    throw new Error('메모 요약 및 태그 생성 중 오류가 발생했습니다.')
  }
}

