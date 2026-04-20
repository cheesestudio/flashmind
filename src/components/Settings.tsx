import { useEffect } from 'react'
import { Settings as SettingsType, Theme } from '../types'

interface SettingsProps {
  settings: SettingsType
  onUpdate: (updates: Partial<SettingsType>) => void
  onClose: () => void
  stats: {
    totalReviewed: number
    streakDays: number
    todayReviewed: number
  }
}

export function Settings({ settings, onUpdate, onClose, stats }: SettingsProps) {
  useEffect(() => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
    }
  }, [])

  const requestNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        onUpdate({ notificationEnabled: true })
      }
    }
  }

  const themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: '浅色', icon: '☀️' },
    { value: 'dark', label: '深色', icon: '🌙' },
    { value: 'auto', label: '自动', icon: '🔄' }
  ]

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">设置</h3>
              <p className="text-sm text-white/60">自定义你的学习体验</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="text-2xl font-bold text-white">{stats.totalReviewed}</div>
              <div className="text-xs text-white/50">总学习</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.streakDays}</div>
              <div className="text-xs text-white/50">连续天数</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.todayReviewed}</div>
              <div className="text-xs text-white/50">今日</div>
            </div>
          </div>

          {/* Theme */}
          <div>
            <h4 className="font-semibold text-white mb-3">主题</h4>
            <div className="flex gap-2">
              {themes.map(theme => (
                <button
                  key={theme.value}
                  onClick={() => onUpdate({ theme: theme.value })}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    settings.theme === theme.value
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className="text-xl block mb-1">{theme.icon}</span>
                  <span className="text-sm text-white">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Goal */}
          <div>
            <h4 className="font-semibold text-white mb-3">每日目标</h4>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={settings.dailyGoal}
                onChange={(e) => onUpdate({ dailyGoal: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-white font-semibold w-12 text-right">{settings.dailyGoal}</span>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h4 className="font-semibold text-white mb-3">学习提醒</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="text-white">桌面通知</span>
                </div>
                <button
                  onClick={settings.notificationEnabled ? () => onUpdate({ notificationEnabled: false }) : requestNotification}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.notificationEnabled ? 'bg-green-500' : 'bg-white/20'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.notificationEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </label>

              {settings.notificationEnabled && (
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <input
                    type="time"
                    value={settings.notificationTime}
                    onChange={(e) => onUpdate({ notificationTime: e.target.value })}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sound */}
          <div>
            <h4 className="font-semibold text-white mb-3">声音</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-white">音效反馈</span>
                </div>
                <button
                  onClick={() => onUpdate({ soundEnabled: !settings.soundEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.soundEnabled ? 'bg-green-500' : 'bg-white/20'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </label>
            </div>
          </div>

          {/* Export */}
          <div>
            <h4 className="font-semibold text-white mb-3">数据导出</h4>
            <p className="text-sm text-white/50 mb-3">导出卡库为 CSV 或 Anki 格式</p>
          </div>
        </div>
      </div>
    </div>
  )
}
