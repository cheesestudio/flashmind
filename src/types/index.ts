export interface Flashcard {
  id: string
  front: string      // 问题/正面
  back: string       // 答案/背面
  createdAt: number
  nextReviewAt: number  // 下次复习时间
  interval: number       // 间隔天数
  easeFactor: number     // 难度因子
}

export interface CardLibrary {
  id: string
  name: string
  description?: string
  cards: Flashcard[]
  createdAt: number
  updatedAt: number
}

export interface StudyRecord {
  libraryId: string
  cardId: string
  reviewedAt: number
  quality: 'again' | 'hard' | 'good' | 'easy'
}

// Learning statistics
export interface DailyStats {
  date: string  // YYYY-MM-DD
  reviewed: number
  correct: number
  incorrect: number
}

export interface StudyStats {
  dailyStats: DailyStats[]
  totalReviewed: number
  totalCorrect: number
  streakDays: number
  lastStudyDate: string | null
}

// Settings
export type Theme = 'light' | 'dark' | 'auto'
export type LearningMode = 'review' | 'listening' | 'quiz'

export interface Settings {
  theme: Theme
  dailyGoal: number
  notificationEnabled: boolean
  notificationTime: string  // HH:mm
  soundEnabled: boolean
  autoPlayAudio: boolean
  quizModeConfig: {
    showOptions: number
    timeLimit: number  // seconds
  }
}

// Quiz mode
export interface QuizQuestion {
  cardId: string
  question: string
  correctAnswer: string
  options: string[]
}