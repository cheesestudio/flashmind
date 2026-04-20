import { useState } from 'react'
import { CardLibrary as CardLibraryType } from '../types'

interface CardLibraryProps {
  libraries: CardLibraryType[]
  onSelect: (lib: CardLibraryType) => void
  onCreate: (name: string, description?: string) => void
  onDelete: (id: string) => void
  onImport: () => void
  onImportPDF: () => void
  onImportVocabulary: () => void
}

export function CardLibrary({
  libraries,
  onSelect,
  onCreate,
  onDelete,
  onImport,
  onImportPDF,
  onImportVocabulary
}: CardLibraryProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreate(name.trim(), description.trim() || undefined)
      setName('')
      setDescription('')
      setShowForm(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
          我的学习空间
        </h1>
        <p className="text-white/60 text-lg">管理你的闪卡库，开启高效学习之旅</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <div className="flex gap-2 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
          <button
            onClick={onImport}
            className="px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200"
          >
            📄 导入JSON
          </button>
          <button
            onClick={onImportPDF}
            className="px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200"
          >
            📕 导入PDF
          </button>
          <button
            onClick={onImportVocabulary}
            className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200"
          >
            📚 导入词汇
          </button>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-200"
        >
          {showForm ? '✕ 取消' : '+ 新建卡库'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="max-w-md mx-auto mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">创建新卡库</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="卡库名称"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-green-500 focus:bg-white/20 transition-all"
                autoFocus
              />
              <input
                type="text"
                placeholder="描述（可选）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-green-500 focus:bg-white/20 transition-all"
              />
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                创建卡库
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Library Grid */}
      {libraries.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {libraries.map((lib, index) => (
            <div
              key={lib.id}
              onClick={() => onSelect(lib)}
              className="group relative p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl border border-white/20 hover:border-green-400/30 cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-white/10">
                    <span className="text-2xl">📚</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteConfirm(lib.id)
                    }}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-green-400 transition-colors">
                  {lib.name}
                </h3>
                {lib.description && (
                  <p className="text-sm text-white/50 mb-3 line-clamp-2">{lib.description}</p>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-white/50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {lib.cards.length} 张卡片
                  </div>
                  {lib.cards.length > 0 && (
                    <span className="px-2.5 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                      可学习
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-white/10">
            <span className="text-5xl">📖</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">还没有卡库</h3>
          <p className="text-white/50 mb-6">点击"新建卡库"开始你的学习之旅</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-200"
          >
            创建第一个卡库
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white text-center mb-2">确认删除</h3>
            <p className="text-white/60 text-center mb-6">此操作无法撤销，卡库中的所有卡片将被永久删除</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-white/80 font-medium bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirm)
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
