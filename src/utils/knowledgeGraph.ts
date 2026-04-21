import { Flashcard, KnowledgeNode } from '../types'

export function findRelatedCards(targetCard: Flashcard, allCards: Flashcard[], limit: number = 5): string[] {
  const relatedIds: string[] = []

  allCards.forEach(card => {
    if (card.id === targetCard.id) return

    let similarity = 0

    // 标签匹配
    if (targetCard.tags && card.tags) {
      const commonTags = targetCard.tags.filter(t => card.tags!.includes(t))
      similarity += commonTags.length * 0.15
    }

    // 文本相似度 (简单关键词匹配)
    const targetWords = new Set(targetCard.front.toLowerCase().split(/\s+/))
    const cardWords = new Set(card.front.toLowerCase().split(/\s+/))
    const commonWords = [...targetWords].filter(w => cardWords.has(w))
    similarity += commonWords.length * 0.1

    // 难度相近
    if (targetCard.difficulty && card.difficulty) {
      const diff = Math.abs(targetCard.difficulty - card.difficulty)
      similarity += Math.max(0, 0.3 - diff * 0.05)
    }

    if (similarity > 0.2) {
      relatedIds.push(card.id)
    }
  })

  return relatedIds.slice(0, limit)
}

export function buildKnowledgeGraph(cards: Flashcard[]): Map<string, KnowledgeNode> {
  const graph = new Map<string, KnowledgeNode>()

  cards.forEach(card => {
    const related = findRelatedCards(card, cards, 8)
    const connections = related.map(targetId => ({
      targetCardId: targetId,
      relationship: 'related' as const,
      strength: 0.5 + Math.random() * 0.5
    }))

    graph.set(card.id, {
      cardId: card.id,
      connections
    })
  })

  return graph
}

export function getLearningPath(cardId: string, graph: Map<string, KnowledgeNode>): string[] {
  const path: string[] = [cardId]
  const visited = new Set<string>([cardId])
  const node = graph.get(cardId)

  if (node) {
    node.connections
      .filter(c => c.relationship === 'prerequisite')
      .sort((a, b) => b.strength - a.strength)
      .forEach(conn => {
        if (!visited.has(conn.targetCardId)) {
          path.push(conn.targetCardId)
          visited.add(conn.targetCardId)
        }
      })
  }

  return path
}

// 自动发现前置知识关系
export function discoverPrerequisites(cards: Flashcard[]): Map<string, string[]> {
  const prerequisites = new Map<string, string[]>()

  cards.forEach(card => {
    const prereqs: string[] = []

    cards.forEach(other => {
      if (card.id === other.id) return

      // 前置知识检测启发式规则
      if (other.difficulty && card.difficulty && other.difficulty < card.difficulty - 2) {
        if (other.front.toLowerCase().includes('基础') || other.front.toLowerCase().includes('定义')) {
          prereqs.push(other.id)
        }
      }
    })

    if (prereqs.length > 0) {
      prerequisites.set(card.id, prereqs)
    }
  })

  return prerequisites
}
