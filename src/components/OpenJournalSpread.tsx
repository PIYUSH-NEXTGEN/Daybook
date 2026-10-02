import { useState, useRef, useEffect } from 'react'
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Snowflake,
  Headphones,
  Copy,
  Heart,
  Share2,
  Check,
  Plus,
  Trash2,
  MapPin,
  Flame,
  Upload,
  RotateCcw
} from 'lucide-react'
import defaultPhoto from '../assets/images/scene.webp'

type WeatherType = 'sunny' | 'partlyCloudy' | 'rainy' | 'windy' | 'snowy'

interface GoalItem {
  id: string
  text: string
  completed: boolean
}

interface OpenJournalSpreadProps {
  onClose?: () => void
  className?: string
}

export function OpenJournalSpread({ className = '' }: OpenJournalSpreadProps) {
  const [weather, setWeather] = useState<WeatherType>('sunny')
  const [isWeatherPickerOpen, setIsWeatherPickerOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string>(defaultPhoto)
  const [topic, setTopic] = useState('')
  const [isEditingTopic, setIsEditingTopic] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string>('Peaceful')
  const [goals, setGoals] = useState<GoalItem[]>([
    { id: '1', text: 'Morning meditation & walk', completed: true },
    { id: '2', text: 'Write down 3 things grateful for', completed: true },
    { id: '3', text: 'Reflect on today’s small steps', completed: false }
  ])
  const [newGoalText, setNewGoalText] = useState('')
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [entryText, setEntryText] = useState(() => {
    return localStorage.getItem('daybook_journal_entry') || ''
  })
  const [locationText, setLocationText] = useState(() => {
    return localStorage.getItem('daybook_journal_location') || ''
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const weatherDropdownRef = useRef<HTMLDivElement>(null)

  const currentDate = new Date()
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  const currentTimeString = currentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  useEffect(() => {
    localStorage.setItem('daybook_journal_entry', entryText)
  }, [entryText])

  useEffect(() => {
    localStorage.setItem('daybook_journal_location', locationText)
  }, [locationText])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        weatherDropdownRef.current &&
        !weatherDropdownRef.current.contains(e.target as Node)
      ) {
        setIsWeatherPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      if (!e.clipboardData) return
      const items = e.clipboardData.items
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
              if (event.target?.result) {
                setPhotoUrl(event.target.result as string)
              }
            }
            reader.readAsDataURL(file)
            break
          }
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  function toggleGoal(id: string) {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    )
  }

  function addGoal() {
    if (!newGoalText.trim()) return
    setGoals((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newGoalText.trim(), completed: false }
    ])
    setNewGoalText('')
    setIsAddingGoal(false)
  }

  function removeGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  function copyPromptText() {
    const promptText =
      'I slow down to hear the flowers bloom and feel the gentle touch of the breeze.'
    navigator.clipboard.writeText(promptText)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const weatherOptions: { type: WeatherType; label: string; icon: typeof Sun }[] = [
    { type: 'sunny', label: 'Sunny', icon: Sun },
    { type: 'partlyCloudy', label: 'Partly Cloudy', icon: Cloud },
    { type: 'rainy', label: 'Rainy', icon: CloudRain },
    { type: 'windy', label: 'Windy', icon: Wind },
    { type: 'snowy', label: 'Snowy', icon: Snowflake }
  ]

  const moods = [
    { id: 'Peaceful', label: 'Peaceful', emoji: '🌿' },
    { id: 'Grateful', label: 'Grateful', emoji: '🙏' },
    { id: 'Happy', label: 'Happy', emoji: '😊' },
    { id: 'Inspired', label: 'Inspired', emoji: '💡' },
    { id: 'Reflective', label: 'Reflective', emoji: '💭' }
  ]

  const ActiveWeatherIcon =
    weatherOptions.find((w) => w.type === weather)?.icon || Sun

  return (
    <div
      className={`relative w-full max-w-[560px] sm:max-w-[640px] md:max-w-[700px] h-[380px] sm:h-[435px] md:h-[475px] rounded-[22px] sm:rounded-[26px] bg-[#8dc0f8] p-1.5 sm:p-2 shadow-[2px_6px_20px_rgba(20,45,80,0.22)] border border-white/40 select-none ${className}`}
    >
      <div className="relative w-full h-full flex flex-col md:flex-row rounded-[18px] sm:rounded-[22px] overflow-hidden bg-transparent shadow-sm">
        <div className="flex-1 h-full bg-[#FAF9F5] rounded-t-[18px] md:rounded-t-none md:rounded-l-[20px] border-r-0 md:border-r border-slate-200/60 p-2.5 sm:p-3.5 flex flex-col justify-between relative shadow-[inset_-4px_0_8px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="space-y-2 sm:space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 relative" ref={weatherDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsWeatherPickerOpen((prev) => !prev)}
                  title="Choose day weather"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/70 flex items-center justify-center text-amber-500 transition-all hover:scale-105 cursor-pointer shadow-2xs"
                >
                  <ActiveWeatherIcon className="w-4 h-4 stroke-[2.2]" />
                </button>

                {isWeatherPickerOpen && (
                  <div className="absolute top-10 left-0 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 min-w-[140px] animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-0.5 block">
                      Day Weather
                    </span>
                    {weatherOptions.map((opt) => {
                      const Icon = opt.icon
                      const isSelected = weather === opt.type
                      return (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => {
                            setWeather(opt.type)
                            setIsWeatherPickerOpen(false)
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#eff6fc] text-[#4f8ee6] font-semibold'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-amber-500" />
                          <span>{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 leading-tight">
                    {dayName}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">
                    {formattedDate}
                  </span>
                </div>
              </div>


            </div>

            <div className="flex flex-col items-center">
              <div className="relative group/photo w-36 sm:w-40 md:w-44 bg-white rounded-2xl p-2 pb-2.5 shadow-sm border border-slate-200/60 transition-transform duration-200 hover:-rotate-1">
                <div className="relative w-full h-20 sm:h-24 md:h-26 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/40">
                  <img
                    src={photoUrl}
                    alt="Journal moment"
                    className="w-full h-full object-cover select-none"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-md bg-white/95 text-slate-800 text-[11px] font-semibold shadow-sm hover:bg-white flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
                      title="Upload photo"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                    {photoUrl !== defaultPhoto && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl(defaultPhoto)}
                        className="p-1 rounded-md bg-white/95 text-slate-800 shadow-sm hover:bg-white cursor-pointer transition-transform hover:scale-105"
                        title="Reset photo"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="pt-1.5 text-center">
                  {isEditingTopic ? (
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onBlur={() => setIsEditingTopic(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingTopic(false)}
                      placeholder="Today's Topic"
                      autoFocus
                      className="text-[11px] sm:text-xs font-medium text-slate-700 text-center w-full bg-slate-50 border-b border-[#6eafe9] px-1 py-0.5 focus:outline-none"
                    />
                  ) : (
                    <p
                      onClick={() => setIsEditingTopic(true)}
                      className={`text-[11px] sm:text-xs font-medium truncate px-0.5 cursor-pointer hover:text-[#4f8ee6] transition-colors ${
                        topic ? 'text-slate-600' : 'text-slate-400 italic'
                      }`}
                      title="Click to edit topic"
                    >
                      {topic || "Today's Topic"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                Today&apos;s Mood
              </span>
              <div className="flex flex-wrap gap-1">
                {moods.map((m) => {
                  const isSelected = selectedMood === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMood(m.id)}
                      className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#eff6fc] border-[#6eafe9] text-[#4f8ee6] font-semibold shadow-2xs'
                          : 'bg-white border-slate-200/70 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{m.emoji}</span>
                      <span className="hidden sm:inline">{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                  Today&apos;s Goals
                </span>
                {!isAddingGoal && (
                  <button
                    type="button"
                    onClick={() => setIsAddingGoal(true)}
                    className="text-[10px] font-semibold text-[#4f8ee6] hover:text-[#3b79ce] flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Add</span>
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {goals.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between gap-1.5 p-1 rounded-md bg-white border border-slate-200/50 hover:border-slate-300/80 transition-colors group/goal"
                  >
                    <button
                      type="button"
                      onClick={() => toggleGoal(g.id)}
                      className="flex items-center gap-1.5 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <div
                        className={`w-3 h-3 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                          g.completed
                            ? 'bg-[#6eafe9] border-[#6eafe9] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {g.completed && <Check className="w-2 h-2 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-[10px] truncate transition-all ${
                          g.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-700 font-medium'
                        }`}
                      >
                        {g.text}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeGoal(g.id)}
                      className="opacity-0 group-hover/goal:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-0.5 cursor-pointer"
                      title="Delete goal"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}

                {isAddingGoal && (
                  <div className="flex items-center gap-1 pt-0.5">
                    <input
                      type="text"
                      value={newGoalText}
                      onChange={(e) => setNewGoalText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addGoal()
                        if (e.key === 'Escape') setIsAddingGoal(false)
                      }}
                      placeholder="Type goal..."
                      autoFocus
                      className="flex-1 text-[10px] px-2 py-0.5 rounded bg-white border border-[#6eafe9] text-slate-700 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addGoal}
                      className="px-2 py-0.5 text-[10px] rounded bg-[#6eafe9] text-white font-medium cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-center gap-1.5 text-center">
            <div className="w-4 h-4 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500">
              <Flame className="w-2.5 h-2.5 fill-amber-500" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">
              5 Day Streak
            </span>
          </div>
        </div>

        <div className="hidden md:flex w-4 sm:w-5 bg-[#a2cbe9] relative z-30 flex-col justify-between py-8 items-center flex-shrink-0">
          <div className="w-4 sm:w-5 h-2 rounded-full bg-gradient-to-r from-slate-400 via-slate-100 to-slate-400 shadow-xs border border-slate-400/80" />
          <div className="w-4 sm:w-5 h-2 rounded-full bg-gradient-to-r from-slate-400 via-slate-100 to-slate-400 shadow-xs border border-slate-400/80" />
          <div className="w-4 sm:w-5 h-2 rounded-full bg-gradient-to-r from-slate-400 via-slate-100 to-slate-400 shadow-xs border border-slate-400/80" />
        </div>

        <div className="flex-1 h-full bg-[#FAF9F5] rounded-b-[18px] md:rounded-b-none md:rounded-r-[20px] border-l-0 md:border-l border-slate-200/60 p-2.5 sm:p-3.5 flex flex-col justify-between relative shadow-[inset_4px_0_8px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="space-y-2 sm:space-y-2.5 flex-1 flex flex-col min-h-0">
            <div className="bg-gradient-to-br from-white/95 via-white/90 to-slate-50/80 rounded-xl p-2 sm:p-2.5 shadow-2xs border border-slate-200/60 backdrop-blur-xs flex-shrink-0">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Headphones className="w-3.5 h-3.5 text-[#4f8ee6]" />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700">
                    Savor the Moment
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  {currentTimeString}
                </span>
              </div>

              <p className="text-[11px] sm:text-xs font-medium text-slate-700 leading-snug text-center py-1 sm:py-1.5 px-1 italic">
                &ldquo;I slow down to hear the flowers bloom and feel the gentle touch of the breeze.&rdquo;
              </p>

              <div className="flex items-center justify-center gap-4 pt-0.5 text-slate-400">
                <button
                  type="button"
                  onClick={copyPromptText}
                  className="hover:text-[#4f8ee6] transition-colors p-0.5 cursor-pointer"
                  title="Copy prompt"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFavorited((prev) => !prev)}
                  className={`transition-colors p-0.5 cursor-pointer ${
                    isFavorited
                      ? 'text-rose-500 fill-rose-500'
                      : 'hover:text-rose-500'
                  }`}
                  title="Favorite prompt"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'DayBook Prompt',
                        text: 'I slow down to hear the flowers bloom and feel the gentle touch of the breeze.'
                      })
                    } else {
                      copyPromptText()
                    }
                  }}
                  className="hover:text-[#4f8ee6] transition-colors p-0.5 cursor-pointer"
                  title="Share prompt"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 space-y-1">
              <span className="text-[9px] font-medium text-slate-400 italic">
                ✍️ Write your thoughts, mood, and reflections:
              </span>

              <div className="relative w-full flex-1 rounded-xl bg-white/70 border border-slate-200/50 p-2 sm:p-2.5 overflow-hidden">
                <textarea
                  value={entryText}
                  onChange={(e) => setEntryText(e.target.value)}
                  placeholder="What happened today? How did the day go? What goals could be done and not done..."
                  className="w-full h-full bg-transparent text-xs sm:text-[13px] text-slate-700 leading-[24px] focus:outline-none resize-none font-sans scrollbar-none"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(transparent, transparent 23px, #e8edf3 23px, #e8edf3 24px)',
                    lineHeight: '24px'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-1.5 text-slate-400 flex-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="Where are you right now..."
                className="text-[10px] text-slate-600 bg-transparent focus:outline-none flex-1 placeholder:text-slate-400 placeholder:italic"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium pl-1.5">
              {entryText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
