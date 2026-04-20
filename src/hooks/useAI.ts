import { useState, useCallback } from 'react'
import { Flashcard } from '../types'

const API_URL = 'https://api.openai.com/v1/chat/completions'
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

interface GenerateOptions {
  text: string
  count?: number
  apiKey?: string
}

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCards = useCallback(async ({ text, count = 5, apiKey = API_KEY }: GenerateOptions): Promise<Flashcard[]> => {
    if (!text.trim()) {
      setError('请输入要生成卡片的文本')
      return []
    }

    if (!apiKey) {
      setError('请配置 OpenAI API Key')
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: '你是一个闪卡生成助手。根据用户提供的文本，生成问答卡片。返回JSON数组格式，每个元素包含question和answer字段。'
            },
            {
              role: 'user',
              content: `请根据以下文本生成 ${count} 个问答卡片（JSON数组格式）。每个卡片包含 question 和 answer 字段。\n\n文本内容：\n${text}`
            }
          ],
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''

      // 解析 JSON
      const cardsData = JSON.parse(content)

      // 转换为 Flashcard 格式
      const now = Date.now()
      const cards: Flashcard[] = cardsData.map((item: any, index: number) => ({
        id: crypto.randomUUID(),
        front: item.question || item.q || '',
        back: item.answer || item.a || '',
        createdAt: now + index,
        nextReviewAt: now,
        interval: 0,
        easeFactor: 2.5
      }))

      return cards
    } catch (err) {
      const message = err instanceof Error ? err.message : '生成失败'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { generateCards, loading, error }
}