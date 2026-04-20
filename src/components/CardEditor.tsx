import { useState } from 'react'
import { Flashcard } from '../types'

interface CardEditorProps {
  cards: Flashcard[]
  onAddCard: (front: string, back: string) => void
  onDeleteCard: (id: string) => void
  onEditCard: (id: string, front: string, back: string) => void
  onBack: () => void
}

export function CardEditor({
  cards,
  onAddCard,
  onDeleteCard,
  onEditCard,
  onBack
}: CardEditorProps) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFront, setEditFront] = useState('')
  const [editBack, setEditBack] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (front.trim() && back.trim()) {
      onAddCard(front.trim(), back.trim())
      setFront('')
      setBack('')
    }
  }

  const startEdit = (card: Flashcard) => {
    setEditingId(card.id)
    setEditFront(card.front)
    setEditBack(card.back)
  }

  const saveEdit = () => {
    if (editingId && editFront.trim() && editBack.trim()) {
      onEditCard(editingId, editFront.trim(), editBack.trim())
      setEditingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 mb-6 text-gray-500 hover:text-blue-600 transition-colors"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回卡库列表
      </button>

      {/* Add Card Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg text-gray-800">添加新卡片</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">问题 / 正面</label>
            <textarea
              placeholder="输入问题内容..."
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">答案 / 背面</label>
            <textarea
              placeholder="输入答案内容..."
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={!front.trim() || !back.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
          >
            添加卡片
          </button>
        </div>
      </form>

      {/* Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-800">卡片列表</h3>
          <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-600 rounded-full">
            {cards.length} 张卡片
          </span>
        </div>

        {cards.length > 0 ? (
          <div className="grid gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="group p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200"
              >
                {editingId === card.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editFront}
                      onChange={(e) => setEditFront(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                      rows={2}
                      placeholder="问题"
                    />
                    <textarea
                      value={editBack}
                      onChange={(e) => setEditBack(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
                      rows={2}
                      placeholder="答案"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                      >
                        保存更改
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2.5 text-gray-600 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-lg">Q</span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{card.front}</p>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-700 rounded-lg">A</span>
                        </div>
                        <p className="text-gray-600 whitespace-pre-wrap">{card.back}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(card)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="编辑"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(card.id)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="删除"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500">还没有卡片</p>
            <p className="text-sm text-gray-400 mt-1">在上方添加你的第一张卡片</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">确认删除</h3>
            <p className="text-gray-500 text-center mb-6">确定要删除这张卡片吗？此操作无法撤销</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-gray-600 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onDeleteCard(deleteConfirm)
                  setDeleteConfirm(null)
                }}
                className="flex-1 px-4 py-2.5 text-white font-medium bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
