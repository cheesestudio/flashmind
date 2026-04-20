import { useState, useEffect } from 'react'
import { Flashcard } from '../types'

interface VocabularyLevel {
  name: string
  description: string
  words: { word: string; translation: string; phonetic?: string; reading?: string }[]
}

interface VocabularyData {
  language: string
  category?: string
  levels: { [key: string]: VocabularyLevel }
}

interface VocabularySelectorProps {
  onImport: (cards: Flashcard[], libraryName?: string) => void
  onClose: () => void
}

const vocabularyCategories = [
  {
    id: 'language',
    name: '语言学习',
    items: [
      { id: 'english', name: '英语', flag: '🇺🇸', color: 'from-red-500 to-orange-500' },
      { id: 'japanese', name: '日语', flag: '🇯🇵', color: 'from-pink-500 to-rose-500' },
      { id: 'korean', name: '韩语', flag: '🇰🇷', color: 'from-purple-500 to-violet-500' },
    ]
  },
  {
    id: 'programming',
    name: '编程技术',
    items: [
      { id: 'programming-beginner', name: '编程入门', flag: '💻', color: 'from-blue-500 to-cyan-500' },
      { id: 'programming-intermediate', name: '编程中级', flag: '⚙️', color: 'from-cyan-500 to-teal-500' },
      { id: 'programming-advanced', name: '编程高级', flag: '🔧', color: 'from-indigo-500 to-blue-500' },
    ]
  },
  {
    id: 'life',
    name: '生活常识',
    items: [
      { id: 'life-knowledge', name: '健康/金融/心理', flag: '📚', color: 'from-green-500 to-emerald-500' },
    ]
  }
]

const categoryMap: { [key: string]: string } = {
  'english': 'vocabulary/english.json',
  'japanese': 'vocabulary/japanese.json',
  'korean': 'vocabulary/korean.json',
  'programming-beginner': 'vocabulary/programming-beginner.json',
  'programming-intermediate': 'vocabulary/programming-intermediate.json',
  'programming-advanced': 'vocabulary/programming-advanced.json',
  'life-knowledge': 'vocabulary/life-knowledge.json'
}

export function VocabularySelector({ onImport, onClose }: VocabularySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [vocabularyData, setVocabularyData] = useState<{ [key: string]: VocabularyData }>({})
  const [loading, setLoading] = useState(false)

  // Load vocabulary when a category is selected
  useEffect(() => {
    if (!selectedCategory) return

    const loadVocabulary = async () => {
      if (vocabularyData[selectedCategory]) return

      setLoading(true)
      try {
        const path = categoryMap[selectedCategory]
        if (!path) return

        const modules = await import(`../../data/${path}`)
        const data = modules.default
        setVocabularyData(prev => ({ ...prev, [selectedCategory]: data }))

        // Auto-select all levels
        if (data.levels) {
          setSelectedLevels(Object.keys(data.levels))
        }
      } catch (error) {
        console.error('Failed to load vocabulary:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVocabulary()
  }, [selectedCategory])

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const toggleLevel = (levelKey: string) => {
    setSelectedLevels(prev =>
      prev.includes(levelKey)
        ? prev.filter(key => key !== levelKey)
        : [...prev, levelKey]
    )
  }

  const handleImport = () => {
    if (!selectedCategory || selectedLevels.length === 0) return

    const data = vocabularyData[selectedCategory]
    if (!data) return

    const now = Date.now()
    const cards: Flashcard[] = []
    let cardIndex = 0

    selectedLevels.forEach(levelKey => {
      const level = data.levels[levelKey]
      if (level?.words) {
        level.words.forEach(word => {
          cards.push({
            id: crypto.randomUUID(),
            front: word.word,
            back: word.translation + (word.phonetic || word.reading ? `\n${word.phonetic || word.reading}` : ''),
            createdAt: now + cardIndex,
            nextReviewAt: now,
            interval: 0,
            easeFactor: 2.5
          })
          cardIndex++
        })
      }
    })

    if (cards.length > 0) {
      const categoryName = vocabularyCategories
        .flatMap(c => c.items)
        .find(item => item.id === selectedCategory)?.name || '词汇'

      onImport(cards, `${categoryName} ${selectedLevels.join('+')}`)
      onClose()
    }
  }

  const getSelectedWordsCount = () => {
    if (!selectedCategory) return 0
    const data = vocabularyData[selectedCategory]
    if (!data) return 0

    let total = 0
    selectedLevels.forEach(levelKey => {
      total += data.levels[levelKey]?.words?.length || 0
    })
    return total
  }

  const currentCategory = vocabularyCategories.find(c => c.id === selectedCategory)
  const currentData = selectedCategory ? vocabularyData[selectedCategory] : null

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">导入词汇</h3>
              <p className="text-sm text-white/60">选择你的学习内容</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!selectedCategory ? (
            // Category Selection
            <div className="space-y-6">
              {vocabularyCategories.map(category => (
                <div key={category.id}>
                  <h5 className="font-semibold text-white/80 mb-3">{category.name}</h5>
                  <div className="grid grid-cols-3 gap-3">
                    {category.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleCategorySelect(item.id)}
                        className="group relative p-5 rounded-2xl border-2 border-white/20 hover:border-transparent transition-all duration-300 overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                        <div className="relative">
                          <span className="text-3xl block mb-2">{item.flag}</span>
                          <span className="text-sm font-medium text-white">{item.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Level Selection
            <div>
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  setSelectedLevels([])
                }}
                className="group flex items-center gap-2 mb-4 text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回分类选择
              </button>

              <h4 className="font-semibold text-lg text-white mb-4">
                选择 {currentCategory?.name || ''} 级别
              </h4>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 mx-auto border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white/60 mt-4">加载中...</p>
                </div>
              ) : currentData?.levels ? (
                <div className="space-y-3">
                  {Object.entries(currentData.levels).map(([key, level]) => (
                    <label
                      key={key}
                      className="flex items-center p-4 rounded-2xl border-2 border-white/10 hover:border-green-400/50 hover:bg-white/5 cursor-pointer transition-all duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLevels.includes(key)}
                        onChange={() => toggleLevel(key)}
                        className="w-5 h-5 text-green-500 rounded-lg border-white/30 bg-white/10"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-white">{level.name}</div>
                        <div className="text-sm text-white/50">
                          {level.description} · {level.words?.length || 0} 词
                        </div>
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg">
                        <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  暂无数据
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-white/60">已选择:</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 font-semibold rounded-full border border-green-500/30">
                {getSelectedWordsCount()} 个词汇
              </span>
            </div>
            <button
              onClick={handleImport}
              disabled={selectedLevels.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
            >
              导入词汇
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
