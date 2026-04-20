import { useState, useEffect } from 'react'
import { Flashcard, QuizQuestion } from '../types'

interface QuizModeProps {
  cards: Flashcard[]
  onBack: () => void
  onComplete: (correct: number, total: number) => void
}

export function QuizMode({ cards, onBack, onComplete }: QuizModeProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [isTimeout, setIsTimeout] = useState(false)

  useEffect(() => {
    if (cards.length < 4) {
      // Not enough cards for quiz
      return
    }

    // Generate quiz questions
    const quizQuestions: QuizQuestion[] = cards.map(card => {
      const otherCards = cards.filter(c => c.id !== card.id)
      const shuffled = [...otherCards].sort(() => Math.random() - 0.5)
      const wrongAnswers = shuffled.slice(0, 3).map(c => c.back)
      const options = [...wrongAnswers, card.back].sort(() => Math.random() - 0.5)

      return {
        cardId: card.id,
        question: card.front,
        correctAnswer: card.back,
        options
      }
    })

    setQuestions(quizQuestions)
  }, [cards])

  useEffect(() => {
    if (showResult || questions.length === 0) return

    setTimeLeft(10)
    const timer = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsTimeout(true)
          setShowResult(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [currentIndex, showResult, questions.length])

  const currentQuestion = questions[currentIndex]

  const handleSelectAnswer = (answer: string) => {
    if (showResult) return
    setSelectedAnswer(answer)
    setShowResult(true)
    if (answer === currentQuestion?.correctAnswer) {
      setCorrectCount(prev => prev + 1)
    }
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setIsTimeout(false)
    } else {
      onComplete(correctCount, questions.length)
    }
  }

  if (cards.length < 4) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-white mb-2">卡片数量不足</h3>
        <p className="text-white/60 mb-4">测验模式需要至少 4 张卡片</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20"
        >
          返回
        </button>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 mx-auto border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/60 mt-4">加载题目中...</p>
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
          退出
        </button>

        <div className="flex items-center gap-4">
          <div className={`text-lg font-semibold ${timeLeft <= 3 ? 'text-red-400' : 'text-white'}`}>
            {timeLeft}s
          </div>
          <div className="text-white/60">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 mb-8">
        <div className="text-center mb-8">
          <div className="text-sm text-white/40 mb-2">测验模式 📝</div>
          <div className="text-2xl font-bold text-white">
            {currentQuestion.question}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === option
            const isCorrect = option === currentQuestion.correctAnswer

            let bgClass = 'bg-white/5 hover:bg-white/10'
            if (showResult) {
              if (isCorrect) {
                bgClass = 'bg-green-500/30 border-green-500'
              } else if (isSelected && !isCorrect) {
                bgClass = 'bg-red-500/30 border-red-500'
              }
            } else if (isSelected) {
              bgClass = 'bg-blue-500/30 border-blue-500'
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(option)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl border-2 border-white/10 text-left transition-all ${bgClass} ${!showResult ? 'hover:border-white/30' : ''}`}
              >
                <span className="text-white/60 mr-3">{String.fromCharCode(65 + idx)}.</span>
                <span className="text-white">{option}</span>
              </button>
            )
          })}
        </div>

        {/* Result */}
        {showResult && (
          <div className={`mt-6 p-4 rounded-xl text-center ${isTimeout ? 'bg-yellow-500/20' : selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <div className="text-lg font-semibold text-white">
              {isTimeout ? '时间到!' : selectedAnswer === currentQuestion.correctAnswer ? '回答正确! ✅' : '回答错误 ❌'}
            </div>
            <div className="text-white/60 mt-1">
              正确答案: {currentQuestion.correctAnswer}
            </div>
          </div>
        )}
      </div>

      {/* Next button */}
      {showResult && (
        <div className="text-center">
          <button
            onClick={nextQuestion}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all"
          >
            {currentIndex < questions.length - 1 ? '下一题' : '查看结果'}
          </button>
        </div>
      )}
    </div>
  )
}
