import { useState, useEffect } from 'react'
import { Flashcard } from '../types'

interface ListeningModeProps {
  cards: Flashcard[]
  onBack: () => void
}

export function ListeningMode({ cards, onBack }: ListeningModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)

  const currentCard = cards[currentIndex]

  useEffect(() => {
    if (!currentCard || !autoPlay || isPlaying) return

    const synth = window.speechSynthesis
    let answerTimeoutId: number | null = null

    const utterance = new SpeechSynthesisUtterance(currentCard.front)
    utterance.lang = 'en-US'
    utterance.rate = 0.8

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => {
      setIsPlaying(false)
      setShowAnswer(true)
      // Play answer after 1.5s
      answerTimeoutId = window.setTimeout(() => {
        const answerUtterance = new SpeechSynthesisUtterance(currentCard.back.replace(/\n/g, ' '))
        answerUtterance.lang = 'zh-CN'
        answerUtterance.rate = 0.8
        answerUtterance.onstart = () => setIsPlaying(true)
        answerUtterance.onend = () => setIsPlaying(false)
        synth.speak(answerUtterance)
      }, 1500)
    }

    synth.speak(utterance)

    return () => {
      synth.cancel()
      if (answerTimeoutId) {
        clearTimeout(answerTimeoutId)
      }
      utterance.onstart = null
      utterance.onend = null
    }
  }, [currentIndex, currentCard, autoPlay, isPlaying])

  const playWord = () => {
    if (!currentCard) return
    const synth = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance(currentCard.front)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    synth.speak(utterance)
  }

  const playAnswer = () => {
    if (!currentCard) return
    const synth = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance(currentCard.back.replace(/\n/g, ' '))
    utterance.lang = 'zh-CN'
    utterance.rate = 0.8
    setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    synth.speak(utterance)
  }

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowAnswer(false)
    }
  }

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setShowAnswer(false)
    }
  }

  if (!currentCard) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🎧</div>
        <h3 className="text-xl font-semibold text-white mb-2">没有可学习的卡片</h3>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20"
        >
          返回
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(e) => setAutoPlay(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            自动播放
          </label>
        </div>

        <div className="text-white/60">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-12 mb-8 text-center min-h-[300px] flex flex-col items-center justify-center">
        <div className="text-sm text-white/40 mb-4">听力模式 🎧</div>

        <div className="text-3xl font-bold text-white mb-4 whitespace-pre-wrap">
          {currentCard.front}
        </div>

        {showAnswer && (
          <div className="text-xl text-white/80 mt-6 whitespace-pre-wrap animate-in fade-in duration-300">
            {currentCard.back}
          </div>
        )}

        {/* Play buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={playWord}
            disabled={isPlaying}
            className="px-6 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            读出问题
          </button>
          <button
            onClick={playAnswer}
            disabled={isPlaying}
            className="px-6 py-3 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            读出答案
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一张
        </button>
        <button
          onClick={nextCard}
          disabled={currentIndex === cards.length - 1}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一张
        </button>
      </div>
    </div>
  )
}
