import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Target,
  Sparkles,
  TrendingUp,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  createJournalGoal,
  deleteJournalGoal,
  getJournalGoals,
  getPreviousJournalGoals,
  updateJournalGoal,
  type JournalGoal,
} from '../lib/api'

interface GoalsState {
  date: string
  today: JournalGoal[]
  previous: JournalGoal[]
  previousDate: string | null
  error: string | null
}

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

const initialGoalsState: GoalsState = {
  date: '',
  today: [],
  previous: [],
  previousDate: null,
  error: null,
}

export function GoalsView({ selectedJournalDate }: { selectedJournalDate: string }) {
  const [state, setState] = useState<GoalsState>(initialGoalsState)
  const requestIdRef = useRef(0)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    const handleGoalsUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ entryDate?: string }>).detail
      if (detail?.entryDate && detail.entryDate !== selectedJournalDate) return
      setRefreshToken((token) => token + 1)
    }

    window.addEventListener('daybook_goals_updated', handleGoalsUpdated)
    return () => window.removeEventListener('daybook_goals_updated', handleGoalsUpdated)
  }, [selectedJournalDate])

  useEffect(() => {
    if (!selectedJournalDate) return

    const requestId = ++requestIdRef.current

    Promise.all([
      getJournalGoals(selectedJournalDate),
      getPreviousJournalGoals(selectedJournalDate),
    ])
      .then(([current, previous]) => {
        if (requestId !== requestIdRef.current) return
        setState({
          date: selectedJournalDate,
          today: current.goals,
          previous: previous.goals,
          previousDate: previous.entryDate,
          error: null,
        })
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) return
        setState({
          date: selectedJournalDate,
          today: [],
          previous: [],
          previousDate: null,
          error: toErrorMessage(err, 'Failed to load goals'),
        })
      })
  }, [selectedJournalDate, refreshToken])

  const isCurrentDate = state.date === selectedJournalDate
  const todayGoals = isCurrentDate ? state.today : []
  const yesterdayGoals = isCurrentDate ? state.previous : []
  const previousDate = isCurrentDate ? state.previousDate : null
  const error = isCurrentDate ? state.error : null
  const isLoading = !isCurrentDate

  function notifyGoalsUpdated() {
    window.dispatchEvent(
      new CustomEvent('daybook_goals_updated', { detail: { entryDate: selectedJournalDate } })
    )
  }

  function replaceGoal(updated: JournalGoal) {
    setState((prev) => ({
      ...prev,
      today: prev.today.map((goal) => (goal.id === updated.id ? updated : goal)),
      error: null,
    }))
  }

  async function toggleGoal(goal: JournalGoal) {
    if (isLoading) return
    try {
      replaceGoal(
        await updateJournalGoal(selectedJournalDate, goal.id, { completed: !goal.completed })
      )
      notifyGoalsUpdated()
    } catch (err) {
      setState((prev) => ({ ...prev, error: toErrorMessage(err, 'Failed to update goal') }))
    }
  }

  async function addGoal() {
    if (isLoading) return
    const text = window.prompt('Enter goal text:')
    if (!text || !text.trim()) return
    try {
      const goal = await createJournalGoal(selectedJournalDate, { text })
      setState((prev) => ({ ...prev, today: [...prev.today, goal], error: null }))
      notifyGoalsUpdated()
    } catch (err) {
      setState((prev) => ({ ...prev, error: toErrorMessage(err, 'Failed to create goal') }))
    }
  }

  async function removeGoal(id: string) {
    if (isLoading) return
    try {
      await deleteJournalGoal(selectedJournalDate, id)
      setState((prev) => ({
        ...prev,
        today: prev.today.filter((goal) => goal.id !== id),
        error: null,
      }))
      notifyGoalsUpdated()
    } catch (err) {
      setState((prev) => ({ ...prev, error: toErrorMessage(err, 'Failed to delete goal') }))
    }
  }

  const todayCompletedCount = todayGoals.filter((g) => g.completed).length
  const todayTotal = todayGoals.length
  const todayPercent = todayTotal > 0 ? Math.round((todayCompletedCount / todayTotal) * 100) : 0

  const yesterdayCompletedCount = yesterdayGoals.filter((g) => g.completed).length
  const yesterdayTotal = yesterdayGoals.length
  const yesterdayPercent =
    yesterdayTotal > 0 ? Math.round((yesterdayCompletedCount / yesterdayTotal) * 100) : 0

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
                <div
                  key={goal.id}
                  className={`w-full p-2 rounded-xl border text-left flex items-start gap-2 transition-all group/goal ${
                    goal.completed
                      ? 'bg-white/80 border-slate-200/60 text-slate-500'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-[#6eafe9]/50 shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    aria-label={goal.completed ? 'Mark goal incomplete' : 'Mark goal complete'}
                    className="mt-0.5 flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eafe9]/50 rounded-full"
                  >
                    {goal.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300 hover:text-[#4f8ee6]" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-tight break-words ${
                        goal.completed ? 'line-through text-slate-400' : 'text-[#1a2b49]'
                      }`}
                    >
                      {goal.text}
                    </p>
                    <span className="inline-block mt-0.5 text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                      No tag
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGoal(goal.id)}
                    title="Delete goal"
                    aria-label={`Delete goal ${goal.text}`}
                    className="mt-0.5 flex-shrink-0 p-0.5 text-slate-400 hover:text-rose-500 opacity-0 focus-visible:opacity-100 group-hover/goal:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              {todayGoals.length === 0 && !isLoading && (
                <button
                  type="button"
                  onClick={addGoal}
                  className="w-full flex items-center justify-between gap-1.5 p-1 sm:p-1.5 rounded-md bg-white/70 border border-dashed border-slate-300 hover:border-[#6eafe9] hover:bg-[#eff6fc]/40 text-slate-400 hover:text-[#4f8ee6] transition-all cursor-pointer group/placeholder"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-3 h-3 rounded border border-dashed border-slate-300 flex items-center justify-center flex-shrink-0" />
                    <span className="text-[10px] italic">
                      Add todays goals here
                    </span>
                  </div>
                  <Plus className="w-2.5 h-2.5 opacity-60 group-hover/placeholder:opacity-100" />
                </button>
              )}
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
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <h3 className="text-xs sm:text-sm font-bold text-[#1a2b49]">
                    Yesterday&apos;s Goals
                  </h3>
                </div>
                {previousDate && (
                  <span className="text-[9px] font-medium text-slate-400">{previousDate}</span>
                )}
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
                <div
                  key={goal.id}
                  className={`w-full p-2 rounded-xl border text-left flex items-start gap-2 transition-all ${
                    goal.completed
                      ? 'bg-white/80 border-slate-200/60 text-slate-500'
                      : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
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
                      No tag
                    </span>
                  </div>
                </div>
              ))}
              {yesterdayGoals.length === 0 && !isLoading && (
                <span className="text-slate-400 text-[10px] italic">
                  No goals for previous date
                </span>
              )}
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
          Comparison: Yesterday achieved {yesterdayCompletedCount} of {yesterdayTotal} goals completed. You have completed {todayCompletedCount} of {todayTotal} goals so far today.
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-rose-50/70 border border-rose-200/60 rounded-xl text-rose-900 text-xs">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
          <span className="font-medium text-[11px] sm:text-xs">Unable to save: {error}</span>
        </div>
      )}
    </div>
  )
}