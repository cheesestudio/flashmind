import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { CardLibrary } from './components/CardLibrary'
import { CardEditor } from './components/CardEditor'
import { StudyMode } from './components/StudyMode'
import { AIGenerator } from './components/AIGenerator'
import { VocabularySelector } from './components/VocabularySelector'
import { Settings } from './components/Settings'
import { SearchBar } from './components/SearchBar'
import { ListeningMode } from './components/ListeningMode'
import { QuizMode } from './components/QuizMode'
import { ProgressVisualization } from './components/ProgressVisualization'
import { useFlashcards } from './hooks/useFlashcards'
import { CardLibrary as CardLibraryType, Flashcard, LearningMode } from './types'
import { extractTextFromPDF } from './utils/pdf'

type View = 'list' | 'editor' | 'study' | 'listening' | 'quiz'

function App() {
  const {
    libraries,
    currentLibrary,
    setCurrentLibrary,
    createLibrary,
    deleteLibrary,
    addCard,
    deleteCard,
    editCard,
    reviewCard,
    getDueCards,
    importLibrary,
    stats,
    settings,
    updateSettings,
    exportToCSV,
    exportToAnki
  } = useFlashcards()

  const [view, setView] = useState<View>('list')
  const [learningMode, setLearningMode] = useState<LearningMode>('review')
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [showVocabularySelector, setShowVocabularySelector] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [pdfText, setPdfText] = useState('')
  const [searchResults, setSearchResults] = useState<Flashcard[]>([])
  const [learningCards, setLearningCards] = useState<Flashcard[]>([])

  // Theme handling
  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'dark' || (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [settings.theme])

  // Notification - with proper cleanup
  useEffect(() => {
    if (!settings.notificationEnabled) return

    const checkDue = () => {
      if (!currentLibrary) return
      const due = getDueCards(currentLibrary.id)
      if (due.length > 0 && Notification.permission === 'granted') {
        try {
          new Notification('AI 闪卡大师', {
            body: `你有 ${due.length} 张卡片需要复习`,
            icon: '/favicon.ico'
          })
        } catch {
          // ignore notification errors
        }
      }
    }

    const [hours, minutes] = settings.notificationTime.split(':').map(Number)
    const now = new Date()
    const target = new Date()
    target.setHours(hours, minutes, 0, 0)

    if (target <= now) {
      target.setDate(target.getDate() + 1)
    }

    const delay = target.getTime() - now.getTime()
    const timeoutId = setTimeout(checkDue, Math.min(delay, 86400000)) // max 24h

    return () => {
      clearTimeout(timeoutId)
    }
  }, [settings.notificationEnabled, settings.notificationTime, currentLibrary, getDueCards])

  const handleSelectLibrary = (lib: CardLibraryType) => {
    setCurrentLibrary(lib)
    setSearchResults(lib.cards)
    setView('editor')
  }

  const handleStudy = () => {
    setLearningMode('review')
    setLearningCards(getDueCards(currentLibrary!.id))
    setView('study')
  }

  const handleListening = () => {
    setLearningCards(currentLibrary!.cards)
    setView('listening')
  }

  const handleQuiz = () => {
    setLearningCards(getDueCards(currentLibrary!.id))
    setView('quiz')
  }

  const handleBack = () => {
    setView('list')
    setCurrentLibrary(null)
  }

  const handleAddCards = (cards: Flashcard[], libraryName?: string) => {
    if (currentLibrary) {
      cards.forEach(card => {
        addCard(currentLibrary.id, card.front, card.back)
      })
      setShowAIGenerator(false)
    } else if (cards.length > 0) {
      const name = libraryName || `词汇库 ${new Date().toLocaleDateString()}`
      const newLib = createLibrary(name)
      cards.forEach(card => {
        addCard(newLib.id, card.front, card.back)
      })
      setShowAIGenerator(false)
      setCurrentLibrary(newLib)
      setView('editor')
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        const lib = importLibrary(text)
        if (lib) {
          alert(`成功导入: ${lib.name}`)
        } else {
          alert('导入失败，请检查文件格式')
        }
      }
    }
    input.click()
  }

  const handleImportPDF = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const text = await extractTextFromPDF(file)
          if (!text.trim()) {
            alert('无法从 PDF 中提取文本')
            return
          }
          setPdfText(text)
          setShowAIGenerator(true)
        } catch (err) {
          alert('PDF 解析失败，请确保文件是有效的 PDF')
          console.error(err)
        }
      }
    }
    input.click()
  }

  const handleExport = (format: 'csv' | 'anki') => {
    if (!currentLibrary) return

    const content = format === 'csv' ? exportToCSV(currentLibrary) : exportToAnki(currentLibrary)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentLibrary.name}.${format === 'csv' ? 'csv' : 'txt'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteCard = (cardId: string) => {
    if (currentLibrary) {
      deleteCard(currentLibrary.id, cardId)
    }
  }

  const handleEditCard = (cardId: string, front: string, back: string) => {
    if (currentLibrary) {
      editCard(currentLibrary.id, cardId, front, back)
    }
  }

  const handleQuizComplete = (correct: number, total: number) => {
    alert(`测验完成!\n正确: ${correct}/${total}\n正确率: ${Math.round((correct/total)*100)}%`)
    setView('editor')
  }

  const dueCards = currentLibrary ? getDueCards(currentLibrary.id) : []
  const todayStat = stats.dailyStats.find(s => s.date === new Date().toISOString().split('T')[0])
  const todayReviewed = todayStat?.reviewed || 0

  const handleSearchFromLibrary = (results: Flashcard[]) => {
    setSearchResults(results)
  }

  // Cleanup only known timers on unmount
  useEffect(() => {
    return () => {
      // ✅ 安全的清理：只清理语音合成，不暴力清除所有定时器
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-3000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full filter blur-3xl"></div>
      </div>

      <Header
        onHome={handleBack}
        libraryName={currentLibrary?.name}
        onSettings={() => setShowSettings(true)}
        onStats={() => setShowProgress(true)}
        todayProgress={todayReviewed}
        dailyGoal={settings.dailyGoal}
      />

      <main className="container mx-auto px-4 py-6">
        {view === 'list' && (
          <CardLibrary
            libraries={libraries}
            onSelect={handleSelectLibrary}
            onCreate={createLibrary}
            onDelete={deleteLibrary}
            onImport={handleImport}
            onImportPDF={handleImportPDF}
            onImportVocabulary={() => setShowVocabularySelector(true)}
          />
        )}

        {view === 'editor' && currentLibrary && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{currentLibrary.name}</h2>
              <div className="space-x-2">
                <button
                  onClick={() => setShowAIGenerator(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
                >
                  🤖 AI 生成
                </button>
                <button
                  onClick={handleStudy}
                  disabled={dueCards.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  📖 学习 ({dueCards.length})
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <SearchBar
                cards={currentLibrary.cards}
                onSearch={handleSearchFromLibrary}
                placeholder="搜索当前卡库..."
              />
            </div>

            {/* Learning mode buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleListening}
                disabled={currentLibrary.cards.length === 0}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 transition flex items-center gap-2"
              >
                🎧 听力模式
              </button>
              <button
                onClick={handleQuiz}
                disabled={dueCards.length < 4}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 transition flex items-center gap-2"
              >
                📝 测验模式
              </button>
              <div className="flex-1" />
              <button
                onClick={() => handleExport('csv')}
                disabled={currentLibrary.cards.length === 0}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 transition"
              >
                📊 CSV
              </button>
              <button
                onClick={() => handleExport('anki')}
                disabled={currentLibrary.cards.length === 0}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 transition"
              >
                🧠 Anki
              </button>
            </div>

            <CardEditor
              cards={searchResults.length > 0 && searchResults !== currentLibrary.cards ? searchResults : currentLibrary.cards}
              onAddCard={(front, back) => addCard(currentLibrary.id, front, back)}
              onDeleteCard={handleDeleteCard}
              onEditCard={handleEditCard}
              onBack={handleBack}
            />
          </div>
        )}

        {view === 'study' && currentLibrary && learningMode === 'review' && (
          <StudyMode
            cards={learningCards}
            onReview={(cardId, quality) => reviewCard(currentLibrary.id, cardId, quality)}
            onBack={() => setView('editor')}
          />
        )}

        {view === 'listening' && currentLibrary && (
          <ListeningMode
            cards={learningCards}
            onBack={() => setView('editor')}
          />
        )}

        {view === 'quiz' && currentLibrary && (
          <QuizMode
            cards={learningCards}
            onBack={() => setView('editor')}
            onComplete={handleQuizComplete}
          />
        )}
      </main>

      {showAIGenerator && (
        <AIGenerator
          onGenerate={handleAddCards}
          onClose={() => {
            setShowAIGenerator(false)
            setPdfText('')
          }}
          initialText={pdfText}
        />
      )}

      {showVocabularySelector && (
        <VocabularySelector
          onImport={handleAddCards}
          onClose={() => setShowVocabularySelector(false)}
        />
      )}

      {showSettings && (
        <Settings
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setShowSettings(false)}
          stats={{
            totalReviewed: stats.totalReviewed,
            streakDays: stats.streakDays,
            todayReviewed
          }}
        />
      )}

      {showProgress && (
        <ProgressVisualization
          dailyStats={stats.dailyStats}
          onClose={() => setShowProgress(false)}
        />
      )}
    </div>
  )
}

export default App