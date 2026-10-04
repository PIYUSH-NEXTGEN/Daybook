/* eslint-disable react-hooks/set-state-in-effect -- syncing controlled selectedDate prop to internal calendar state */
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon, Check } from 'lucide-react'

export interface CalendarEntryDotProps {
  isToday?: boolean
  className?: string
}

export function CalendarEntryDot({ isToday = false, className = '' }: CalendarEntryDotProps) {
  return (
    <span
      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
        isToday ? 'bg-white' : 'bg-[#6eafe9]'
      } ${className}`}
    />
  )
}

interface CalendarViewProps {
  onOpenJournal?: () => void
  hasEntryForDate?: (year: number, month: number, day: number) => boolean
  selectedDate?: string
  onSelectDate?: (dateKey: string) => void
}

const YEARS = [2026, 2027, 2028, 2029, 2030]

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function CalendarView({ onOpenJournal, hasEntryForDate, selectedDate, onSelectDate }: CalendarViewProps) {
  const currentDate = new Date()
  const initialYear = Math.max(2026, Math.min(2030, currentDate.getFullYear()))
  const [selectedYear, setSelectedYear] = useState(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number)
      if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) return Math.max(2026, Math.min(2030, y))
    }
    return initialYear
  })
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (selectedDate) {
      const [, m] = selectedDate.split('-').map(Number)
      if (!Number.isNaN(m)) return m - 1
    }
    return currentDate.getMonth()
  })
  const [selectedDay, setSelectedDay] = useState(() => {
    if (selectedDate) {
      const [, , d] = selectedDate.split('-').map(Number)
      if (!Number.isNaN(d)) return d
    }
    return currentDate.getDate()
  })
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  const yearPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (yearPickerRef.current && !yearPickerRef.current.contains(event.target as Node)) {
        setIsYearPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (!selectedDate) return
    const [y, m, d] = selectedDate.split('-').map(Number)
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return
    setSelectedYear(Math.max(2026, Math.min(2030, y)))
    setSelectedMonth(m - 1)
    setSelectedDay(d)
  }, [selectedDate])

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay()
  const daysInPrevMonth = new Date(selectedYear, selectedMonth, 0).getDate()

  const isPrevDisabled = selectedYear === 2026 && selectedMonth === 0
  const isNextDisabled = selectedYear === 2030 && selectedMonth === 11

  function handlePrevMonth() {
    if (isPrevDisabled) return
    setSlideDirection('left')
    if (selectedMonth > 0) {
      setSelectedMonth(selectedMonth - 1)
    } else if (selectedYear > 2026) {
      setSelectedYear(selectedYear - 1)
      setSelectedMonth(11)
    }
  }

  function handleNextMonth() {
    if (isNextDisabled) return
    setSlideDirection('right')
    if (selectedMonth < 11) {
      setSelectedMonth(selectedMonth + 1)
    } else if (selectedYear < 2030) {
      setSelectedYear(selectedYear + 1)
      setSelectedMonth(0)
    }
  }

  function handleSelectYear(year: number) {
    setSelectedYear(year)
    setIsYearPickerOpen(false)
  }

  function handleSelectMonth(monthIndex: number) {
    setSlideDirection(monthIndex >= selectedMonth ? 'right' : 'left')
    setSelectedMonth(monthIndex)
  }

  const prevMonthPaddingDays: number[] = []
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    prevMonthPaddingDays.push(daysInPrevMonth - i)
  }

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const totalDisplayedSlots = Math.ceil((prevMonthPaddingDays.length + currentMonthDays.length) / 7) * 7
  const nextMonthPaddingCount = totalDisplayedSlots - (prevMonthPaddingDays.length + currentMonthDays.length)
  const nextMonthPaddingDays = Array.from({ length: nextMonthPaddingCount }, (_, i) => i + 1)

  const selectedDateObj = new Date(selectedYear, selectedMonth, selectedDay)
  const formattedSelectedDate = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="w-full flex flex-col justify-between space-y-3">
      <div className="w-full flex justify-center relative z-30" ref={yearPickerRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsYearPickerOpen((prev) => !prev)}
            aria-label="Select year"
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF9F5] hover:bg-[#eff6fc] border border-slate-200 hover:border-[#6eafe9]/60 text-xs sm:text-sm font-bold text-[#1a2b49] hover:text-[#4f8ee6] transition-all shadow-xs cursor-pointer group"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#4f8ee6]" />
            <span>{selectedYear}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#4f8ee6] transition-transform duration-200 ${
                isYearPickerOpen ? 'rotate-180 text-[#4f8ee6]' : ''
              }`}
            />
          </button>

          {isYearPickerOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 p-1.5 z-50 flex flex-row gap-1 animate-in fade-in zoom-in-95 duration-150">
              {YEARS.map((year) => {
                const isCurrent = year === selectedYear
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleSelectYear(year)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-[#6eafe9] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-[#1a2b49]'
                    }`}
                  >
                    <span>{year}</span>
                    {isCurrent && <Check className="w-3 h-3" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-full bg-[#FAF9F5] p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isPrevDisabled}
            aria-label="Previous month"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-[#4f8ee6] hover:bg-white hover:shadow-xs disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex flex-col items-center">
            <span
              key={`${selectedYear}-${selectedMonth}-title`}
              className={`text-base sm:text-lg font-bold text-[#1a2b49] transition-all duration-300 ${
                slideDirection === 'right'
                  ? 'animate-in fade-in slide-in-from-right-3'
                  : 'animate-in fade-in slide-in-from-left-3'
              }`}
            >
              {MONTHS[selectedMonth]} {selectedYear}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={isNextDisabled}
            aria-label="Next month"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-[#4f8ee6] hover:bg-white hover:shadow-xs disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {MONTHS_SHORT.map((m, idx) => {
            const isMonthActive = idx === selectedMonth
            return (
              <button
                key={m}
                type="button"
                onClick={() => handleSelectMonth(idx)}
                className={`flex-1 min-w-[32px] sm:min-w-[36px] py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isMonthActive
                    ? 'bg-[#6eafe9] text-white shadow-xs'
                    : 'text-slate-500 hover:text-[#4f8ee6] hover:bg-white'
                }`}
              >
                {m}
              </button>
            )
          })}
        </div>

        <div>
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((d) => (
              <span key={d} className="text-[11px] sm:text-xs font-semibold text-slate-400 py-0.5 select-none">
                {d}
              </span>
            ))}
          </div>

          <div
            key={`${selectedYear}-${selectedMonth}-grid`}
            className={`grid grid-cols-7 gap-1 text-center transition-all duration-300 ${
              slideDirection === 'right'
                ? 'animate-in fade-in slide-in-from-right-3'
                : 'animate-in fade-in slide-in-from-left-3'
            }`}
          >
            {prevMonthPaddingDays.map((day, idx) => (
              <div
                key={`prev-${idx}`}
                className="py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg font-medium text-slate-300 select-none flex flex-col items-center justify-center"
              >
                <span>{day}</span>
              </div>
            ))}

            {currentMonthDays.map((day) => {
              const isToday =
                currentDate.getFullYear() === selectedYear &&
                currentDate.getMonth() === selectedMonth &&
                currentDate.getDate() === day

              const isSelected = selectedDay === day
              const hasEntry = hasEntryForDate ? hasEntryForDate(selectedYear, selectedMonth, day) : false

              const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day)
                    onSelectDate?.(dateKey)
                  }}
                  className={`py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg font-medium relative flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isToday
                      ? 'bg-[#6eafe9] text-white font-bold shadow-xs'
                      : isSelected
                        ? 'border border-[#6eafe9] bg-[#eff6fc] text-[#1a2b49] font-bold shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{day}</span>
                  {hasEntry && <CalendarEntryDot isToday={isToday} />}
                </button>
              )
            })}

            {nextMonthPaddingDays.map((day, idx) => (
              <div
                key={`next-${idx}`}
                className="py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg font-medium text-slate-300 select-none flex flex-col items-center justify-center"
              >
                <span>{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-400 px-1">
        <span className="font-medium text-slate-600">
          Selected: {formattedSelectedDate}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[#6eafe9] font-semibold">
            {selectedDay === currentDate.getDate() && selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear()
              ? 'Today'
              : 'Journal date'}
          </span>
          {onOpenJournal && (
            <button
              type="button"
              onClick={onOpenJournal}
              className="text-[#4f8ee6] hover:text-[#3876cb] font-semibold cursor-pointer transition-colors"
            >
              Write &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
