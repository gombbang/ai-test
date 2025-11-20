const STORAGE_KEY = 'memo-app-summaries'

interface SummaryCache {
  [memoId: string]: string
}

export const summaryCache = {
  // 특정 메모의 요약 가져오기
  getSummary: (memoId: string): string | null => {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const cache: SummaryCache = JSON.parse(stored)
      return cache[memoId] || null
    } catch (error) {
      console.error('Error loading summary from cache:', error)
      return null
    }
  },

  // 특정 메모의 요약 저장하기
  setSummary: (memoId: string, summary: string): void => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const cache: SummaryCache = stored ? JSON.parse(stored) : {}

      cache[memoId] = summary
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.error('Error saving summary to cache:', error)
    }
  },

  // 특정 메모의 요약 삭제하기
  deleteSummary: (memoId: string): void => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const cache: SummaryCache = JSON.parse(stored)
      delete cache[memoId]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.error('Error deleting summary from cache:', error)
    }
  },

  // 모든 요약 캐시 클리어
  clearAll: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  },
}

