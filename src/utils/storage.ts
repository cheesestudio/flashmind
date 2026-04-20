import { CardLibrary, StudyStats, Settings } from '../types'

const STORAGE_KEY = 'flashmind_libraries'
const STATS_KEY = 'flashmind_stats'
const SETTINGS_KEY = 'flashmind_settings'

export function getLibraries(): CardLibrary[] {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function saveLibraries(libraries: CardLibrary[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(libraries))
}

export function getLibrary(id: string): CardLibrary | undefined {
  const libraries = getLibraries()
  return libraries.find(lib => lib.id === id)
}

export function createLibrary(name: string, description?: string): CardLibrary {
  const library: CardLibrary = {
    id: crypto.randomUUID(),
    name,
    description,
    cards: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  const libraries = getLibraries()
  libraries.push(library)
  saveLibraries(libraries)
  return library
}

export function updateLibrary(id: string, updates: Partial<CardLibrary>): CardLibrary | null {
  const libraries = getLibraries()
  const index = libraries.findIndex(lib => lib.id === id)
  if (index === -1) return null

  libraries[index] = { ...libraries[index], ...updates, updatedAt: Date.now() }
  saveLibraries(libraries)
  return libraries[index]
}

export function deleteLibrary(id: string): boolean {
  const libraries = getLibraries()
  const filtered = libraries.filter(lib => lib.id !== id)
  if (filtered.length === libraries.length) return false

  saveLibraries(filtered)
  return true
}

export function exportLibrary(library: CardLibrary): string {
  return JSON.stringify(library, null, 2)
}

export function importLibrary(json: string): CardLibrary | null {
  try {
    const data = JSON.parse(json)
    if (!data.name || !Array.isArray(data.cards)) return null
    return {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cards: data.cards.map((c: any) => ({
        ...c,
        id: c.id || crypto.randomUUID(),
        createdAt: c.createdAt || Date.now()
      }))
    }
  } catch {
    return null
  }
}

// Study Statistics
export function getStats(): StudyStats {
  const data = localStorage.getItem(STATS_KEY)
  return data ? JSON.parse(data) : {
    dailyStats: [],
    totalReviewed: 0,
    totalCorrect: 0,
    streakDays: 0,
    lastStudyDate: null
  }
}

export function saveStats(stats: StudyStats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

export function recordReview(quality: 'again' | 'hard' | 'good' | 'easy'): void {
  const stats = getStats()
  const today = new Date().toISOString().split('T')[0]

  let dailyStats = stats.dailyStats
  const todayIndex = dailyStats.findIndex(s => s.date === today)

  if (todayIndex === -1) {
    dailyStats.push({ date: today, reviewed: 0, correct: 0, incorrect: 0 })
  }

  const idx = todayIndex === -1 ? dailyStats.length - 1 : todayIndex
  dailyStats[idx].reviewed++

  if (quality === 'good' || quality === 'easy') {
    dailyStats[idx].correct++
  } else {
    dailyStats[idx].incorrect++
  }

  // Calculate streak
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (stats.lastStudyDate === yesterdayStr || stats.lastStudyDate === today) {
    stats.streakDays = stats.lastStudyDate === yesterdayStr ? stats.streakDays + 1 : stats.streakDays
  } else if (stats.lastStudyDate !== today) {
    stats.streakDays = 1
  }

  stats.totalReviewed++
  if (quality === 'good' || quality === 'easy') {
    stats.totalCorrect++
  }
  stats.lastStudyDate = today
  stats.dailyStats = dailyStats.slice(-90) // Keep last 90 days

  saveStats(stats)
}

// Settings
const defaultSettings: Settings = {
  theme: 'dark',
  dailyGoal: 20,
  notificationEnabled: false,
  notificationTime: '09:00',
  soundEnabled: true,
  autoPlayAudio: false,
  quizModeConfig: {
    showOptions: 4,
    timeLimit: 10
  }
}

export function getSettings(): Settings {
  const data = localStorage.getItem(SETTINGS_KEY)
  return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function updateSettings(updates: Partial<Settings>): Settings {
  const current = getSettings()
  const updated = { ...current, ...updates }
  saveSettings(updated)
  return updated
}

// Export functions
export function exportToCSV(library: CardLibrary): string {
  const headers = ['问题', '答案', '创建时间', '下次复习']
  const rows = library.cards.map(card => [
    `"${card.front.replace(/"/g, '""')}"`,
    `"${card.back.replace(/"/g, '""')}"`,
    new Date(card.createdAt).toLocaleDateString(),
    new Date(card.nextReviewAt).toLocaleDateString()
  ])
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function exportToAnki(library: CardLibrary): string {
  return library.cards.map(card =>
    `${card.front.replace(/;/g, ';;')};${card.back.replace(/;/g, ';;')}`
  ).join('\n')
}