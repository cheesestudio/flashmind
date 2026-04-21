import { Flashcard, MicroReviewSession, WeaknessPoint } from '../types'

export function calculateNextReview(
  card: Flashcard,
  quality: 'again' | 'hard' | 'good' | 'easy',
  responseTime?: number
): Flashcard {
  const now = Date.now()
  let newInterval: number
  let newEaseFactor = card.easeFactor || 2.5

  // 更新统计数据
  const reviewCount = (card.reviewCount || 0) + 1
  const successCount = (card.successCount || 0) + (quality !== 'again' ? 1 : 0)
  const failCount = (card.failCount || 0) + (quality === 'again' ? 1 : 0)

  // 响应时间加权调整
  if (responseTime && responseTime > 0) {
    const avgResponseTime = card.averageResponseTime
      ? (card.averageResponseTime * (reviewCount - 1) + responseTime) / reviewCount
      : responseTime

    // 响应时间超过5秒视为困难
    if (responseTime > 5000 && quality === 'good') {
      newEaseFactor -= 0.1
    }
  }

  if (quality === 'again') {
    newInterval = 1
    newEaseFactor = Math.max(1.3, newEaseFactor - 0.2)
  } else {
    const baseInterval = card.interval || 1
    const multiplier = quality === 'easy' ? 1.3 : quality === 'hard' ? 0.8 : 1.0
    newInterval = Math.round(baseInterval * newEaseFactor * multiplier)
    newEaseFactor = quality === 'easy'
      ? newEaseFactor + 0.15
      : quality === 'hard'
        ? newEaseFactor - 0.15
        : newEaseFactor
    newEaseFactor = Math.max(1.3, Math.min(3.2, newEaseFactor))
  }

  const intervalMs = newInterval * 24 * 60 * 60 * 1000
  const forgetProbability = calculateForgetProbability({
    ...card,
    interval: newInterval,
    easeFactor: newEaseFactor
  })

  return {
    ...card,
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReviewAt: now + intervalMs,
    lastReviewedAt: now,
    reviewCount,
    successCount,
    failCount,
    forgetProbability,
    difficulty: calculateCardDifficulty(card)
  }
}

// 遗忘概率预测模型 (基于SM-2扩展的遗忘曲线)
export function calculateForgetProbability(card: Flashcard): number {
  const daysSinceReview = card.lastReviewedAt
    ? (Date.now() - card.lastReviewedAt) / (24 * 60 * 60 * 1000)
    : 0

  const stability = card.interval * (card.easeFactor / 2.5)
  const decayRate = 0.9 / Math.max(stability, 1)

  // 基础遗忘概率
  let probability = 1 - Math.exp(-decayRate * daysSinceReview)

  // 历史表现加权
  if (card.reviewCount && card.reviewCount > 0) {
    const successRate = (card.successCount || 0) / card.reviewCount
    probability = probability * (1.5 - successRate)
  }

  // 难度加权
  if (card.difficulty) {
    probability = probability * (0.7 + card.difficulty * 0.03)
  }

  return Math.min(1, Math.max(0, probability))
}

// 计算卡片综合难度
export function calculateCardDifficulty(card: Flashcard): number {
  if (!card.reviewCount || card.reviewCount < 3) return 5

  const failRate = (card.failCount || 0) / card.reviewCount
  const easePenalty = (3.2 - card.easeFactor) / 1.9 * 5

  let difficulty = (failRate * 7) + easePenalty
  return Math.min(10, Math.max(1, Math.round(difficulty)))
}

// 获取需要微复习的卡片 (遗忘概率 > 30%)
export function getCardsForMicroReview(cards: Flashcard[], limit: number = 5): Flashcard[] {
  return cards
    .filter(card => {
      const prob = calculateForgetProbability(card)
      return prob > 0.3 && prob < 0.85
    })
    .sort((a, b) => calculateForgetProbability(b) - calculateForgetProbability(a))
    .slice(0, limit)
}

// 薄弱点诊断分析
export function detectWeaknessPoints(cards: Flashcard[]): WeaknessPoint[] {
  const weaknesses: WeaknessPoint[] = []

  cards.forEach(card => {
    if (!card.reviewCount || card.reviewCount < 3) return

    const failRate = (card.failCount || 0) / card.reviewCount

    if (failRate > 0.4) {
      weaknesses.push({
        cardId: card.id,
        pattern: '高频错误',
        frequency: card.failCount || 0,
        confidence: failRate,
        suggestedActions: [
          '拆分复杂概念',
          '添加更多示例',
          '增加复习频率',
          '创建关联卡片'
        ]
      })
    }

    if (card.difficulty && card.difficulty > 8) {
      weaknesses.push({
        cardId: card.id,
        pattern: '高难度内容',
        frequency: card.reviewCount,
        confidence: card.difficulty / 10,
        suggestedActions: [
          'AI优化卡片表述',
          '简化问题描述',
          '分步骤讲解',
          '添加视觉辅助'
        ]
      })
    }
  })

  return weaknesses.sort((a, b) => b.confidence - a.confidence)
}

export function getCardsDueForReview(cards: Flashcard[]): Flashcard[] {
  const now = Date.now()
  return cards
    .filter(card => card.nextReviewAt <= now)
    .sort((a, b) => {
      // 优先复习遗忘概率高的卡片
      const probA = calculateForgetProbability(a)
      const probB = calculateForgetProbability(b)
      if (Math.abs(probA - probB) > 0.2) {
        return probB - probA
      }
      return a.nextReviewAt - b.nextReviewAt
    })
}

// 微复习会话管理
export function createMicroReviewSession(cards: Flashcard[]): MicroReviewSession {
  return {
    id: Math.random().toString(36).substring(7),
    startTime: Date.now(),
    duration: 0,
    cardsReviewed: 0,
    completed: false
  }
}

// AI卡片优化建议评分
export function scoreCardQuality(card: Flashcard): { score: number; suggestions: string[] } {
  const suggestions: string[] = []
  let score = 10

  if (card.front.length < 5) {
    score -= 2
    suggestions.push('问题描述过短，建议增加上下文')
  }

  if (card.back.length < 10) {
    score -= 2
    suggestions.push('答案过于简略，建议详细说明')
  }

  if (card.front.length > 150) {
    score -= 1
    suggestions.push('问题过长，建议拆分')
  }

  if (!card.tags || card.tags.length === 0) {
    score -= 1
    suggestions.push('建议添加标签便于分类')
  }

  return { score: Math.max(1, score), suggestions }
}

export function formatNextReview(interval: number): string {
  if (interval === 0) return '立即'
  if (interval === 1) return '1天'
  if (interval < 7) return `${interval}天`
  if (interval < 30) return `${Math.round(interval / 7)}周`
  return `${Math.round(interval / 30)}月`
}

export function formatForgetProbability(prob: number): string {
  if (prob < 0.2) return '记忆牢固'
  if (prob < 0.4) return '轻度遗忘'
  if (prob < 0.6) return '中度遗忘'
  if (prob < 0.8) return '高度遗忘'
  return '已遗忘'
}