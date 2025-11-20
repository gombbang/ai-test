'use client'

import { useEffect, useRef, useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'

interface MemoDetailModalProps {
  memo: Memo | null
  isOpen: boolean
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => Promise<void>
}

export default function MemoDetailModal({
  memo,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: MemoDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // 배경 클릭으로 모달 닫기
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const handleEdit = () => {
    if (memo) {
      onEdit(memo)
      onClose()
    }
  }

  const handleDelete = async () => {
    if (memo && window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      try {
        await onDelete(memo.id)
        onClose()
      } catch (error) {
        console.error('Failed to delete memo:', error)
        alert('메모 삭제에 실패했습니다.')
      }
    }
  }

  const handleGenerateSummary = async () => {
    if (!memo || !memo.content || memo.content.trim().length === 0) {
      setSummaryError('요약할 내용이 없습니다.')
      return
    }

    setIsLoadingSummary(true)
    setSummaryError(null)

    try {
      const response = await fetch(`/api/memos/${memo.id}/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: memo.content }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '요약 생성에 실패했습니다.')
      }

      const data = await response.json()
      setSummary(data.summary)
      // 메모 객체 업데이트 (부모 컴포넌트에서 리로드 필요)
      // 요약은 이미 데이터베이스에 저장되었으므로 다음 로드 시 자동으로 포함됨
    } catch (error) {
      console.error('Summary generation error:', error)
      setSummaryError(
        error instanceof Error
          ? error.message
          : '요약 생성 중 오류가 발생했습니다.'
      )
    } finally {
      setIsLoadingSummary(false)
    }
  }

  // 모달이 열릴 때 메모의 요약 불러오기
  useEffect(() => {
    if (isOpen && memo) {
      // 메모 객체에 요약이 있으면 표시
      if (memo.summary) {
        setSummary(memo.summary)
        setSummaryError(null)
      } else {
        setSummary(null)
        setSummaryError(null)
      }
      setIsLoadingSummary(false)
    }
  }, [isOpen, memo])

  // 모달이 닫힐 때 에러 상태만 초기화 (요약은 유지하지 않음)
  useEffect(() => {
    if (!isOpen) {
      setSummaryError(null)
      setIsLoadingSummary(false)
    }
  }, [isOpen])

  if (!isOpen || !memo) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {memo.title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(memo.category)}`}
                >
                  {MEMO_CATEGORIES[
                    memo.category as keyof typeof MEMO_CATEGORIES
                  ] || memo.category}
                </span>
                <span className="text-sm text-gray-500">
                  작성: {formatDate(memo.createdAt)}
                </span>
                {memo.updatedAt !== memo.createdAt && (
                  <span className="text-sm text-gray-500">
                    수정: {formatDate(memo.updatedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="닫기"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {/* 요약 섹션 */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                AI 요약
              </h3>
              <button
                onClick={handleGenerateSummary}
                disabled={isLoadingSummary}
                className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoadingSummary ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    생성 중...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    {summary ? '다시 생성' : '요약 생성'}
                  </>
                )}
              </button>
            </div>
            {summaryError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-2">
                {summaryError}
              </div>
            )}
            {summary && (
              <div className="text-sm text-gray-700 leading-relaxed">
                {summary}
              </div>
            )}
            {!summary && !summaryError && !isLoadingSummary && (
              <div className="text-sm text-gray-500 italic">
                버튼을 클릭하여 AI가 메모를 요약해드립니다.
              </div>
            )}
          </div>

          <div className="prose prose-slate max-w-none" data-color-mode="light">
            <MDEditor.Markdown
              source={memo.content}
              style={{
                whiteSpace: 'pre-wrap',
                backgroundColor: 'transparent',
                padding: '0',
              }}
              data-color-mode="light"
            />
          </div>

          {/* 태그 */}
          {memo.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">태그</h3>
              <div className="flex gap-2 flex-wrap">
                {memo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              ESC 키 또는 배경 클릭으로 닫기
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                편집
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
