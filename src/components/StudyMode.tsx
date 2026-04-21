import { useState, useEffect, useCallback } from 'react'
import { Flashcard } from '../types'

interface StudyModeProps {
  cards: Flashcard[]
  onReview: (cardId: string, quality: 'again' | 'hard' | 'good' | 'easy') => void
  onBack: () => void
}

export function StudyMode({ cards, onReview, onBack }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [activeRecallMode, setActiveRecallMode] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [showUserAnswer, setShowUserAnswer] = useState(false)


  if (cards.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
          <span className="text-5xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">太棒了！</h2>
        <p className="text-gray-500 mb-8">今天没有需要复习的卡片</p>
        <button
          onClick={onBack}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-200"
        >
          返回
        </button>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  const handleFlip = () => {
    if (isFlipping) return
    setIsFlipping(true)
    setShowAnswer(!showAnswer)
    setTimeout(() => setIsFlipping(false), 300)
  }

  const handleReview = (quality: 'again' | 'hard' | 'good' | 'easy') => {
    onReview(currentCard.id, quality)
    setReviewedCount(prev => prev + 1)
    setShowAnswer(false)

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setShowComplete(true)
    }
  }

  const progress = ((currentIndex + 1) / cards.length) * 100

  // Keyboard shortcuts
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (showComplete) return

    if (e.code === 'Space' && !isFlipping) {
      e.preventDefault()
      handleFlip()
    }

    if (showAnswer) {
      if (e.code === 'Digit1' || e.code === 'Numpad1') handleReview('again')
      if (e.code === 'Digit2' || e.code === 'Numpad2') handleReview('hard')
      if (e.code === 'Digit3' || e.code === 'Numpad3') handleReview('good')
      if (e.code === 'Digit4' || e.code === 'Numpad4') handleReview('easy')
    }

    if (e.code === 'Escape') {
      onBack()
    }
  }, [showAnswer, isFlipping, showComplete, handleFlip, handleReview, onBack])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  if (showComplete) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-6xl">🏆</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3">
          学习完成！
        </h2>
        <p className="text-gray-500 text-lg mb-2">今日复习</p>
        <p className="text-5xl font-bold text-gray-800 mb-8">{reviewedCount} <span className="text-xl font-normal text-gray-500">张卡片</span></p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setShowComplete(false)
              setCurrentIndex(0)
              setReviewedCount(0)
            }}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            再学一遍
          </button>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-200"
          >
            完成学习
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          退出
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            {currentIndex + 1} / {cards.length}
          </span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div
        onClick={handleFlip}
        className={`relative min-h-[400px] bg-white rounded-3xl shadow-xl border border-gray-100 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl ${
          isFlipping ? 'scale-[0.98]' : ''
        }`}
      >
        {/* Card Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>

        {/* Front */}
        <div className={`absolute inset-0 p-10 flex flex-col items-center justify-center transition-all duration-300 ${
          showAnswer ? 'opacity-0 rotate-y-180' : 'opacity-100'
        }`}>
          <div className="absolute top-4 left-4 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            问题
          </div>
          <p className="text-2xl md:text-3xl font-semibold text-gray-800 text-center whitespace-pre-wrap">
            {currentCard.front}
          </p>
          <div className="absolute bottom-8 flex items-center gap-2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span className="text-sm">点击显示答案</span>
          </div>
        </div>

        {/* Back */}
        <div className={`absolute inset-0 p-10 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 transition-all duration-300 ${
          showAnswer ? 'opacity-100' : 'opacity-0 rotate-y-180'
        }`}>
          <div className="absolute top-4 left-4 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
            答案
          </div>
          <p className="text-xl md:text-2xl text-gray-700 text-center whitespace-pre-wrap">
            {currentCard.back}
          </p>
        </div>
      </div>

      {/* Rating Buttons */}
      <div className={`mt-8 transition-all duration-300 ${
        showAnswer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        <p className="text-center text-gray-500 mb-4">你觉得这个答案记得怎么样？</p>
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => handleReview('again')}
            className="group p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 rounded-2xl transition-all duration-200"
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">😵</div>
            <div className="font-semibold text-red-700">忘记</div>
            <div className="text-xs text-red-500 mt-1">&lt; 1 分钟</div>
          </button>
          <button
            onClick={() => handleReview('hard')}
            className="group p-4 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-300 rounded-2xl transition-all duration-200"
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🤔</div>
            <div className="font-semibold text-orange-700">困难</div>
            <div className="text-xs text-orange-500 mt-1">1 天后</div>
          </button>
          <button
            onClick={() => handleReview('good')}
            className="group p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 rounded-2xl transition-all duration-200"
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">😊</div>
            <div className="font-semibold text-green-700">良好</div>
            <div className="text-xs text-green-500 mt-1">3 天后</div>
          </button>
          <button
            onClick={() => handleReview('easy')}
            className="group p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 rounded-2xl transition-all duration-200"
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">😎</div>
            <div className="font-semibold text-blue-700">简单</div>
            <div className="text-xs text-blue-500 mt-1">7 天后</div>
          </button>
        </div>
      </div>
    </div>
  )
}
