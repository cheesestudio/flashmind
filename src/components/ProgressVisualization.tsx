import { useMemo } from 'react'
import { DailyStats } from '../types'

interface ProgressVisualizationProps {
  dailyStats: DailyStats[]
  onClose: () => void
}

export function ProgressVisualization({ dailyStats, onClose }: ProgressVisualizationProps) {
  const heatmapData = useMemo(() => {
    const today = new Date()
    const days: { date: string; count: number; level: number }[] = []

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const stat = dailyStats.find(s => s.date === dateStr)
      const count = stat?.reviewed || 0

      let level = 0
      if (count > 0) level = 1
      if (count >= 5) level = 2
      if (count >= 10) level = 3
      if (count >= 20) level = 4

      days.push({ date: dateStr, count, level })
    }

    return days
  }, [dailyStats])

  const weeks = useMemo(() => {
    const result: typeof heatmapData[] = []
    for (let i = 0; i < heatmapData.length; i += 7) {
      result.push(heatmapData.slice(i, i + 7))
    }
    return result
  }, [heatmapData])

  const monthLabels = useMemo(() => {
    const months: { label: string; startWeek: number }[] = []
    weeks.forEach((week, idx) => {
      const firstDay = new Date(week[0]?.date)
      if (idx === 0 || firstDay.getDate() <= 7) {
        months.push({
          label: `${firstDay.getMonth() + 1}月`,
          startWeek: idx
        })
      }
    })
    return months
  }, [weeks])

  const dayLabels = ['日', '一', '三', '五']
  const dayIndices = [0, 1, 3, 5]

  const levelColors = [
    'bg-white/5',
    'bg-green-500/30',
    'bg-green-500/50',
    'bg-green-500/70',
    'bg-green-500'
  ]

  const totalReviewed = dailyStats.reduce((sum, s) => sum + s.reviewed, 0)
  const totalCorrect = dailyStats.reduce((sum, s) => sum + s.correct, 0)
  const accuracy = totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0
  const avgPerDay = dailyStats.length > 0 ? Math.round(totalReviewed / dailyStats.length) : 0

  // Recent 7 days
  const recentStats = dailyStats.slice(-7)

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">学习统计</h3>
              <p className="text-sm text-white/60">查看你的学习进度</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="text-2xl font-bold text-white">{totalReviewed}</div>
              <div className="text-xs text-white/50">总学习</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
              <div className="text-xs text-white/50">正确率</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="text-2xl font-bold text-blue-400">{avgPerDay}</div>
              <div className="text-xs text-white/50">日均</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="text-2xl font-bold text-purple-400">{dailyStats.length}</div>
              <div className="text-xs text-white/50">学习天数</div>
            </div>
          </div>

          {/* Heatmap */}
          <div>
            <h4 className="font-semibold text-white mb-3">学习日历</h4>
            <div className="overflow-x-auto pb-2">
              <div className="inline-block min-w-full">
                {/* Month labels */}
                <div className="flex mb-1 ml-8">
                  {monthLabels.map((month, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-white/40"
                      style={{
                        marginLeft: idx === 0 ? 0 : `${(month.startWeek - (monthLabels[idx - 1]?.startWeek || 0)) * 14 - 24}px`
                      }}
                    >
                      {month.label}
                    </div>
                  ))}
                </div>

                <div className="flex gap-1">
                  {/* Day labels */}
                  <div className="flex flex-col gap-1 mr-1">
                    {dayIndices.map(idx => (
                      <div key={idx} className="h-3 text-xs text-white/40 leading-3">
                        {dayLabels[idx / 2]}
                      </div>
                    ))}
                  </div>

                  {/* Heatmap grid */}
                  <div className="flex gap-1">
                    {weeks.map((week, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-1">
                        {week.map((day) => (
                          <div
                            key={day.date}
                            className={`w-3 h-3 rounded-sm ${levelColors[day.level]} cursor-pointer hover:ring-1 hover:ring-white/50 transition-all`}
                            title={`${day.date}: ${day.count} 张`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
                  <span>少</span>
                  <div className="flex gap-1">
                    {levelColors.map((color, idx) => (
                      <div key={idx} className={`w-3 h-3 rounded-sm ${color}`} />
                    ))}
                  </div>
                  <span>多</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent 7 days */}
          <div>
            <h4 className="font-semibold text-white mb-3">最近 7 天</h4>
            <div className="flex items-end gap-2 h-24">
              {recentStats.length > 0 ? recentStats.map((stat, idx) => {
                const maxCount = Math.max(...recentStats.map(s => s.reviewed), 1)
                const height = (stat.reviewed / maxCount) * 100
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${height}%`, minHeight: stat.reviewed > 0 ? '8px' : '0' }}
                    />
                    <div className="text-xs text-white/40 mt-1">
                      {new Date(stat.date).getDate()}日
                    </div>
                    <div className="text-xs text-white/60">{stat.reviewed}</div>
                  </div>
                )
              }) : (
                <div className="flex-1 text-center text-white/40 py-8">暂无数据</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
