export interface Flashcard {
  id: string
  front: string      // 问题/正面
  back: string       // 答案/背面
  createdAt: number
  nextReviewAt: number  // 下次复习时间
  interval: number       // 间隔天数
  easeFactor: number     // 难度因子
  // 下一代功能字段
  forgetProbability?: number  // 遗忘概率 0-1
  reviewCount?: number        // 总复习次数
  successCount?: number       // 成功次数
  failCount?: number          // 失败次数
  lastReviewedAt?: number     // 上次复习时间
  averageResponseTime?: number // 平均响应时间(ms)
  relatedCardIds?: string[]   // 关联卡片ID(知识图谱)
  tags?: string[]             // 标签
  difficulty?: number         // 计算难度 1-10
  audioUrl?: string           // 音频地址
  aiOptimized?: boolean       // 是否已AI优化
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

// 下一代创新功能类型
export interface MicroReviewSession {
  id: string
  startTime: number
  duration: number // 秒
  cardsReviewed: number
  completed: boolean
}

export interface WeaknessPoint {
  cardId: string
  pattern: string
  frequency: number
  confidence: number
  suggestedActions: string[]
}

export interface KnowledgeNode {
  cardId: string
  connections: {
    targetCardId: string
    relationship: 'prerequisite' | 'related' | 'followup' | 'antonym'
    strength: number
  }[]
}

export interface SpeakingPracticeResult {
  cardId: string
  transcript: string
  accuracy: number
  pronunciationScore: number
  fluencyScore: number
  feedback: string
}

export interface BackgroundListeningConfig {
  enabled: boolean
  volume: number
  speed: number
  repeatCount: number
  voice: string
  autoStart: boolean
  silentMode: boolean
}

// Settings
export type Theme = 'light' | 'dark' | 'auto'
export type LearningMode = 'review' | 'listening' | 'quiz' | 'speaking' | 'micro'

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
  // 下一代功能配置
  backgroundListening: BackgroundListeningConfig
  microReviewEnabled: boolean
  microReviewInterval: number // 分钟
  forgetPredictionEnabled: boolean
  aiOptimizationEnabled: boolean
  knowledgeGraphEnabled: boolean
  weaknessDetectionEnabled: boolean
  speakingPracticeEnabled: boolean
}

// Quiz mode
export interface QuizQuestion {
  cardId: string
  question: string
  correctAnswer: string
  options: string[]
}