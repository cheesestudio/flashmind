import { useState, useEffect, useCallback } from 'react'
import { CardLibrary, Flashcard, StudyStats, Settings } from '../types'
import * as storage from '../utils/storage'
import { calculateNextReview, getCardsDueForReview } from '../utils/spacedReview'

// Prevent StrictMode double execution
let initialized = false
let deduplicationComplete = false

export function useFlashcards() {
  const [libraries, setLibraries] = useState<CardLibrary[]>([])
  const [currentLibrary, setCurrentLibrary] = useState<CardLibrary | null>(null)
  const [stats, setStats] = useState<StudyStats>(storage.getStats())
  const [settings, setSettings] = useState<Settings>(storage.getSettings())

  // FULL DEDUPLICATION + CLEANUP - RUNS ONLY ONCE PER APP LIFETIME
  useEffect(() => {
    if (deduplicationComplete) return
    deduplicationComplete = true

    console.log('🔧 Running full card deduplication...')

    // 1. Cleanup all duplicate cards
    const allLibs = storage.getLibraries()
    let totalRemoved = 0

    const cleaned = allLibs.map(lib => {
      const seenFronts = new Set<string>()
      const uniqueCards = lib.cards.filter(card => {
        const key = card.front.trim().toLowerCase()
        if (seenFronts.has(key)) {
          totalRemoved++
          return false
        }
        seenFronts.add(key)
        return true
      })

      if (uniqueCards.length !== lib.cards.length) {
        console.log(`✅ Cleaned ${lib.cards.length - uniqueCards.length} duplicate cards in ${lib.name}`)
        storage.updateLibrary(lib.id, { cards: uniqueCards })
        return { ...lib, cards: uniqueCards }
      }
      return lib
    })

    console.log(`✅ Total duplicate cards removed: ${totalRemoved}`)

    // 2. Remove empty libraries
    const nonEmpty = cleaned.filter(lib => lib.cards.length > 0)
    if (nonEmpty.length !== cleaned.length) {
      console.log(`✅ Removed ${cleaned.length - nonEmpty.length} empty libraries`)
      storage.saveLibraries(nonEmpty)
    }

    setLibraries(nonEmpty)
    setStats(storage.getStats())
    setSettings(storage.getSettings())

    initialized = true
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

    lib.cards.push(card)
    storage.updateLibrary(libraryId, { cards: lib.cards })

    // Optimized state update: no full reload
    setLibraries(prev => prev.map(l =>
      l.id === libraryId ? { ...l, cards: [...l.cards, card] } : l
    ))

    if (currentLibrary?.id === libraryId) {
      setCurrentLibrary(prev => prev ? { ...prev, cards: [...prev.cards, card] } : null)
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
