import { Flashcard } from '../types'

export function calculateNextReview(
  card: Flashcard,
  quality: 'again' | 'hard' | 'good' | 'easy'
): Flashcard {
  const now = Date.now()
  let newInterval: number
  let newEaseFactor = card.easeFactor || 2.5

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

  return {
    ...card,
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReviewAt: now + intervalMs
  }
}

export function getCardsDueForReview(cards: Flashcard[]): Flashcard[] {
  const now = Date.now()
  return cards
    .filter(card => card.nextReviewAt <= now)
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt)
}

export function formatNextReview(interval: number): string {
  if (interval === 0) return '立即'
  if (interval === 1) return '1天'
  if (interval < 7) return `${interval}天`
  if (interval < 30) return `${Math.round(interval / 7)}周`
  return `${Math.round(interval / 30)}月`
}