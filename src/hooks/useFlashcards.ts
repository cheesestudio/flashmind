import { useState, useEffect, useCallback } from 'react'
import { CardLibrary, Flashcard, StudyStats, Settings } from '../types'
import * as storage from '../utils/storage'
import { calculateNextReview, getCardsDueForReview } from '../utils/spacedReview'

const vocabularyFiles = [
  { file: 'vocabulary/english.json', name: '英语词汇' },
  { file: 'vocabulary/japanese.json', name: '日语词汇' },
  { file: 'vocabulary/korean.json', name: '韩语词汇' },
  { file: 'vocabulary/programming-beginner.json', name: '编程入门' },
  { file: 'vocabulary/programming-intermediate.json', name: '编程中级' },
  { file: 'vocabulary/programming-advanced.json', name: '编程高级' },
  { file: 'vocabulary/life-knowledge.json', name: '生活常识' },
]

// Prevent StrictMode double execution
let initialized = false
let vocabImported = false

export function useFlashcards() {
  const [libraries, setLibraries] = useState<CardLibrary[]>([])
  const [currentLibrary, setCurrentLibrary] = useState<CardLibrary | null>(null)
  const [stats, setStats] = useState<StudyStats>(storage.getStats())
  const [settings, setSettings] = useState<Settings>(storage.getSettings())

  // Initialize - load JSON files or from localStorage
  useEffect(() => {
    if (initialized) return
    initialized = true

    const init = async () => {
      let allLibs = storage.getLibraries()

      // Load JSON files if localStorage is empty
      if (allLibs.length === 0 && !vocabImported) {
        vocabImported = true
        console.log('Loading vocabulary JSON files...')

        for (const vocab of vocabularyFiles) {
          try {
            const response = await fetch(`/data/${vocab.file}`)
            const data = await response.json()

            if (data.levels) {
              const lib = storage.createLibrary(vocab.name)

              Object.values(data.levels).forEach((level: any) => {
                if (level.words) {
                  level.words.forEach((word: any) => {
                    const flashcard: Flashcard = {
                      id: crypto.randomUUID(),
                      front: word.word,
                      back: word.translation + (word.phonetic || word.reading ? `\n${word.phonetic || word.reading}` : ''),
                      createdAt: Date.now(),
                      nextReviewAt: Date.now(),
                      interval: 0,
                      easeFactor: 2.5
                    }
                    lib.cards.push(flashcard)
                  })
                }
              })

              storage.updateLibrary(lib.id, { cards: lib.cards })
              console.log(`Loaded ${lib.name}: ${lib.cards.length} cards`)
            }
          } catch (err) {
            console.error(`Failed to load ${vocab.name}:`, err)
          }
        }
        allLibs = storage.getLibraries()
      }

      // Deduplication
      const cleaned = allLibs.map(lib => {
        const seenFronts = new Set<string>()
        const uniqueCards = lib.cards.filter(card => {
          const key = card.front.trim().toLowerCase()
          if (seenFronts.has(key)) return false
          seenFronts.add(key)
          return true
        })
        if (uniqueCards.length !== lib.cards.length) {
          storage.updateLibrary(lib.id, { cards: uniqueCards })
          return { ...lib, cards: uniqueCards }
        }
        return lib
      })

      setLibraries(cleaned)
      setStats(storage.getStats())
      setSettings(storage.getSettings())
      console.log('Initialization complete, libraries:', cleaned.length)
    }

    init()
  }, [])

  const createLibrary = useCallback((name: string, description?: string) => {
    const lib = storage.createLibrary(name, description)
    setLibraries(prev => [...prev, lib])
    return lib
  }, [])

  const updateLibrary = useCallback((id: string, updates: Partial<CardLibrary>) => {
    const updated = storage.updateLibrary(id, updates)
    if (updated) {
      setLibraries(prev => prev.map(lib => lib.id === id ? updated : lib))
      if (currentLibrary?.id === id) {
        setCurrentLibrary(updated)
      }
    }
    return updated
  }, [currentLibrary])

  const deleteLibrary = useCallback((id: string) => {
    if (storage.deleteLibrary(id)) {
      setLibraries(prev => prev.filter(lib => lib.id !== id))
      if (currentLibrary?.id === id) {
        setCurrentLibrary(null)
      }
    }
  }, [currentLibrary])

  const addCard = useCallback((libraryId: string, front: string, back: string) => {
    const lib = storage.getLibrary(libraryId)
    if (!lib) return null

    // Prevent duplicate cards with exact same front content
    const exists = lib.cards.some(card => card.front.trim() === front.trim())
    if (exists) {
      console.log(`Skipping duplicate card: ${front}`)
      return null
    }

    const card: Flashcard = {
      id: crypto.randomUUID(),
      front,
      back,
      createdAt: Date.now(),
      nextReviewAt: Date.now(),
      interval: 0,
      easeFactor: 2.5
    }

    // ✅ 修复：单次添加，避免重复提交
    const updatedCards = [...lib.cards, card]
    storage.updateLibrary(libraryId, { cards: updatedCards })

    // 使用存储后的完整数组更新状态，避免双重追加
    setLibraries(prev => prev.map(l =>
      l.id === libraryId ? { ...l, cards: updatedCards } : l
    ))

    if (currentLibrary?.id === libraryId) {
      setCurrentLibrary(prev => prev ? { ...prev, cards: updatedCards } : null)
    }

    return card
  }, [currentLibrary])

  const deleteCard = useCallback((libraryId: string, cardId: string) => {
    const lib = storage.getLibrary(libraryId)
    if (!lib) return

    const updatedCards = lib.cards.filter(c => c.id !== cardId)
    storage.updateLibrary(libraryId, { cards: updatedCards })

    // Optimized state update
    setLibraries(prev => prev.map(l =>
      l.id === libraryId ? { ...l, cards: updatedCards } : l
    ))

    if (currentLibrary?.id === libraryId) {
      setCurrentLibrary(prev => prev ? { ...prev, cards: updatedCards } : null)
    }
  }, [currentLibrary])

  const editCard = useCallback((libraryId: string, cardId: string, front: string, back: string) => {
    const lib = storage.getLibrary(libraryId)
    if (!lib) return

    const updatedCards = lib.cards.map(c =>
      c.id === cardId ? { ...c, front, back } : c
    )

    storage.updateLibrary(libraryId, { cards: updatedCards })

    // Optimized state update
    setLibraries(prev => prev.map(l =>
      l.id === libraryId ? { ...l, cards: updatedCards } : l
    ))

    if (currentLibrary?.id === libraryId) {
      setCurrentLibrary(prev => prev ? { ...prev, cards: updatedCards } : null)
    }
  }, [currentLibrary])

  const reviewCard = useCallback((libraryId: string, cardId: string, quality: 'again' | 'hard' | 'good' | 'easy') => {
    const lib = storage.getLibrary(libraryId)
    if (!lib) return

    const cardIndex = lib.cards.findIndex(c => c.id === cardId)
    if (cardIndex === -1) return

    const updatedCard = calculateNextReview(lib.cards[cardIndex], quality)
    const updatedCards = [...lib.cards]
    updatedCards[cardIndex] = updatedCard

    storage.updateLibrary(libraryId, { cards: updatedCards })

    // Record study statistics
    storage.recordReview(quality)
    setStats(storage.getStats())

    // Optimized state update
    setLibraries(prev => prev.map(l =>
      l.id === libraryId ? { ...l, cards: updatedCards } : l
    ))

    if (currentLibrary?.id === libraryId) {
      setCurrentLibrary(prev => prev ? { ...prev, cards: updatedCards } : null)
    }
  }, [currentLibrary])

  const getDueCards = useCallback((libraryId: string) => {
    const lib = storage.getLibrary(libraryId)
    return lib ? getCardsDueForReview(lib.cards) : []
  }, [])

  const importLibrary = useCallback((json: string) => {
    const lib = storage.importLibrary(json)
    if (lib) {
      setLibraries(prev => [...prev, lib])
      return lib
    }
    return null
  }, [])

  return {
    libraries,
    currentLibrary,
    setCurrentLibrary,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    addCard,
    deleteCard,
    editCard,
    reviewCard,
    getDueCards,
    importLibrary,
    stats,
    settings,
    updateSettings: (updates: Partial<Settings>) => {
      const updated = storage.updateSettings(updates)
      setSettings(updated)
      return updated
    },
    exportToCSV: (library: CardLibrary) => storage.exportToCSV(library),
    exportToAnki: (library: CardLibrary) => storage.exportToAnki(library)
  }
}
