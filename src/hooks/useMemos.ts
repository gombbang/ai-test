'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Memo, MemoFormData } from '@/types/memo'
import { supabase } from '@/lib/supabaseClient'

// Supabase 데이터베이스 스키마 타입
interface SupabaseMemo {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  summary: string | null
  created_at: string
  updated_at: string
}

// Supabase 데이터를 Memo 타입으로 변환
const transformSupabaseMemo = (dbMemo: SupabaseMemo): Memo => ({
  id: dbMemo.id,
  title: dbMemo.title,
  content: dbMemo.content,
  category: dbMemo.category,
  tags: dbMemo.tags || [],
  summary: dbMemo.summary || undefined,
  createdAt: dbMemo.created_at,
  updatedAt: dbMemo.updated_at,
})

// Memo 타입을 Supabase 데이터베이스 스키마로 변환
const transformToSupabase = (memo: Partial<Memo>): Partial<SupabaseMemo> => ({
  title: memo.title,
  content: memo.content,
  category: memo.category,
  tags: memo.tags,
  summary: memo.summary || null,
})

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 메모 로드
  useEffect(() => {
    const loadMemos = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('memos')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Failed to load memos:', error)
          return
        }

        const transformedMemos = (data || []).map(transformSupabaseMemo)
        setMemos(transformedMemos)
      } catch (error) {
        console.error('Failed to load memos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMemos()
  }, [])

  // 메모 생성
  const createMemo = useCallback(
    async (formData: MemoFormData): Promise<Memo> => {
      const newMemoData = transformToSupabase({
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const { data, error } = await supabase
        .from('memos')
        .insert([newMemoData])
        .select()
        .single()

      if (error) {
        console.error('Failed to create memo:', error)
        throw error
      }

      const newMemo = transformSupabaseMemo(data as SupabaseMemo)
      setMemos(prev => [newMemo, ...prev])

      // 메모 저장 후 자동으로 태그 생성
      try {
        const response = await fetch(`/api/memos/${newMemo.id}/summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: newMemo.content,
            generateTags: true,
          }),
        })

        if (response.ok) {
          const { tags } = await response.json()
          // 생성된 태그와 기존 태그 병합 (중복 제거)
          const mergedTags = [
            ...new Set([...(formData.tags || []), ...(tags || [])]),
          ]

          // 데이터베이스에 병합된 태그 업데이트
          const { data: updatedData, error: updateError } = await supabase
            .from('memos')
            .update({ tags: mergedTags })
            .eq('id', newMemo.id)
            .select()
            .single()

          if (!updateError && updatedData) {
            const updatedMemo = transformSupabaseMemo(updatedData as SupabaseMemo)
            setMemos(prev =>
              prev.map(memo => (memo.id === newMemo.id ? updatedMemo : memo))
            )
            return updatedMemo
          }
        }
      } catch (tagError) {
        console.error('Failed to generate tags:', tagError)
        // 태그 생성 실패해도 메모 생성은 성공으로 처리
      }

      return newMemo
    },
    []
  )

  // 메모 업데이트
  const updateMemo = useCallback(
    async (id: string, formData: MemoFormData): Promise<void> => {
      const updateData = transformToSupabase({
        ...formData,
        updatedAt: new Date().toISOString(),
      })

      const { data, error } = await supabase
        .from('memos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Failed to update memo:', error)
        throw error
      }

      const updatedMemo = transformSupabaseMemo(data as SupabaseMemo)
      setMemos(prev => prev.map(memo => (memo.id === id ? updatedMemo : memo)))

      // 메모 수정 후 자동으로 태그 생성
      try {
        const response = await fetch(`/api/memos/${id}/summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: updatedMemo.content,
            generateTags: true,
          }),
        })

        if (response.ok) {
          const { tags } = await response.json()
          // 생성된 태그와 기존 태그 병합 (중복 제거)
          const mergedTags = [
            ...new Set([...(formData.tags || []), ...(tags || [])]),
          ]

          // 데이터베이스에 병합된 태그 업데이트
          const { data: finalData, error: updateError } = await supabase
            .from('memos')
            .update({ tags: mergedTags })
            .eq('id', id)
            .select()
            .single()

          if (!updateError && finalData) {
            const finalMemo = transformSupabaseMemo(finalData as SupabaseMemo)
            setMemos(prev =>
              prev.map(memo => (memo.id === id ? finalMemo : memo))
            )
          }
        }
      } catch (tagError) {
        console.error('Failed to generate tags:', tagError)
        // 태그 생성 실패해도 메모 수정은 성공으로 처리
      }
    },
    []
  )

  // 메모 삭제
  const deleteMemo = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from('memos').delete().eq('id', id)

    if (error) {
      console.error('Failed to delete memo:', error)
      throw error
    }

    setMemos(prev => prev.filter(memo => memo.id !== id))
  }, [])

  // 메모 검색
  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  // 카테고리 필터링
  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  // 특정 메모 가져오기
  const getMemoById = useCallback(
    (id: string): Memo | undefined => {
      return memos.find(memo => memo.id === id)
    },
    [memos]
  )

  // 필터링된 메모 목록
  const filteredMemos = useMemo(() => {
    let filtered = memos

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory)
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          memo.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [memos, selectedCategory, searchQuery])

  // 모든 메모 삭제
  const clearAllMemos = useCallback(async (): Promise<void> => {
    const { error } = await supabase.from('memos').delete().neq('id', '')

    if (error) {
      console.error('Failed to clear memos:', error)
      throw error
    }

    setMemos([])
    setSearchQuery('')
    setSelectedCategory('all')
  }, [])

  // 통계 정보
  const stats = useMemo(() => {
    const totalMemos = memos.length
    const categoryCounts = memos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: totalMemos,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [memos, filteredMemos])

  return {
    // 상태
    memos: filteredMemos,
    allMemos: memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,

    // 메모 CRUD
    createMemo,
    updateMemo,
    deleteMemo,
    getMemoById,

    // 필터링 & 검색
    searchMemos,
    filterByCategory,

    // 유틸리티
    clearAllMemos,
  }
}
