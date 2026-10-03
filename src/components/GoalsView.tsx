import { useState } from 'react'
import { CheckCircle2, Circle, Target, Sparkles, TrendingUp } from 'lucide-react'

export interface GoalItem {
  id: string
  text: string
  completed: boolean
  tag: string
}

const initialTodayGoals: GoalItem[] = [
  {
    id: 't-1',
    text: 'Morning reflection and mood check-in',
    completed: true,
    tag: 'Reflection'
  },
  {
    id: 't-2',
    text: 'Capture 3 key takeaways from reading',
    completed: false,
    tag: 'Learning'
  },
  {
    id: 't-3',
    text: 'Evening gratitude entry before bed',
    completed: false,
    tag: 'Habit'
  },
  {
    id: 't-4',
    text: 'Review weekly progress and notes',
    completed: false,
    tag: 'Planning'
  }
]

const initialYesterdayGoals: GoalItem[] = [
  {
    id: 'y-1',
    text: 'Daily evening reflection and review',
    completed: true,
    tag: 'Reflection'
  },
  {
    id: 'y-2',
    text: 'Write 400 words on project progress',
    completed: true,
    tag: 'Writing'
  },
  {
    id: 'y-3',
    text: 'Digital detox 30 mins before sleep',
    completed: true,
    tag: 'Habit'
  },
  {
    id: 'y-4',
    text: 'Organize journal tags and ideas',
    completed: true,
    tag: 'Organization'
  }
]

export function GoalsView() {
  const [todayGoals, setTodayGoals] = useState<GoalItem[]>(initialTodayGoals)
  const [yesterdayGoals, setYesterdayGoals] = useState<GoalItem[]>(initialYesterdayGoals)

  function toggleTodayGoal(id: string) {
    setTodayGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    )
  }

  function toggleYesterdayGoal(id: string) {
    setYesterdayGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    )
  }

  const todayCompletedCount = todayGoals.filter((g) => g.completed).length
  const todayTotal = todayGoals.length
  const todayPercent = todayTotal > 0 ? Math.round((todayCompletedCount / todayTotal) * 100) : 0

  const yesterdayCompletedCount = yesterdayGoals.filter((g) => g.completed).length
  const yesterdayTotal = yesterdayGoals.length
  const yesterdayPercent = yesterdayTotal > 0 ? Math.round((yesterdayCompletedCount / yesterdayTotal) * 100) : 0

  return (
    <div className="w-full flex flex-col justify-between space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        <div className="bg-[#FAF9F5] p-3 sm:p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#4f8ee6]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#1a2b49]">
                  Today&apos;s Goals
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eff6fc] text-[#4f8ee6] border border-[#6eafe9]/20">
                {todayCompletedCount} / {todayTotal} Done
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#6eafe9] rounded-full transition-all duration-300"
                style={{ width: `${todayPercent}%` }}
              />
            </div>

            <div className="space-y-1.5 max-h-[170px] sm:max-h-[195px] overflow-y-auto pr-1 scrollbar-none">
              {todayGoals.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleTodayGoal(goal.id)}
                  className={`w-full p-2 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                    goal.completed
                      ? 'bg-white/80 border-slate-200/60 text-slate-500'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-[#6eafe9]/50 shadow-2xs'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {goal.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300 hover:text-[#4f8ee6]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-tight break-words ${
                        goal.completed ? 'line-through text-slate-400' : 'text-[#1a2b49]'
                      }`}
                    >
                      {goal.text}
                    </p>
                    <span className="inline-block mt-0.5 text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                      {goal.tag}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1 border-t border-slate-200/50 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
            <span>Today&apos;s Progress</span>
            <span className="font-bold text-[#4f8ee6]">{todayPercent}% Complete</span>
          </div>
        </div>

        <div className="bg-[#FAF9F5] p-3 sm:p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <h3 className="text-xs sm:text-sm font-bold text-[#1a2b49]">
                  Yesterday&apos;s Goals
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                {yesterdayCompletedCount} / {yesterdayTotal} Done
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${yesterdayPercent}%` }}
              />
            </div>

            <div className="space-y-1.5 max-h-[170px] sm:max-h-[195px] overflow-y-auto pr-1 scrollbar-none">
              {yesterdayGoals.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleYesterdayGoal(goal.id)}
                  className={`w-full p-2 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                    goal.completed
                      ? 'bg-white/80 border-slate-200/60 text-slate-500'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {goal.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-tight break-words ${
                        goal.completed ? 'line-through text-slate-400' : 'text-[#1a2b49]'
                      }`}
                    >
                      {goal.text}
                    </p>
                    <span className="inline-block mt-0.5 text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                      {goal.tag}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1 border-t border-slate-200/50 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
            <span>Yesterday&apos;s Outcome</span>
            <span className="font-bold text-emerald-600">{yesterdayPercent}% Complete</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-emerald-900 text-xs">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span className="font-medium text-[11px] sm:text-xs">
          Comparison: Yesterday achieved 100% completion. You have completed {todayCompletedCount} of {todayTotal} goals so far today.
        </span>
      </div>
    </div>
  )
}
