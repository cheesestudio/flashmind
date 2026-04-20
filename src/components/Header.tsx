interface HeaderProps {
  onHome: () => void
  libraryName?: string
  onSettings?: () => void
  onStats?: () => void
  todayProgress?: number
  dailyGoal?: number
}

export function Header({ onHome, libraryName, onSettings, onStats, todayProgress = 0, dailyGoal = 20 }: HeaderProps) {
  const progressPercent = Math.min((todayProgress / dailyGoal) * 100, 100)

  return (
    <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={onHome}
          className="group flex items-center gap-3 text-xl font-bold text-white hover:text-green-400 transition-all duration-300"
        >
          <span className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl text-white text-lg shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105">
            🧠
          </span>
          <span className="hidden sm:inline bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI 闪卡大师</span>
        </button>

        <div className="flex items-center gap-4">
          {/* Daily progress */}
          {todayProgress > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
              <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-white/60">{todayProgress}/{dailyGoal}</span>
            </div>
          )}

          {/* Stats button */}
          {onStats && (
            <button
              onClick={onStats}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="学习统计"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          )}

          {/* Settings button */}
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="设置"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}

          {libraryName && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white/80">{libraryName}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}