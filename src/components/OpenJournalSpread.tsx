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
  Check,
  Plus,
  Trash2,
  MapPin,
  Flame,
  Upload,
  RotateCcw
} from 'lucide-react'
import defaultPhoto from '../assets/images/scene.webp'
import type { JournalTextStyle } from './JournalToolbar'

type WeatherType = 'sunny' | 'partlyCloudy' | 'rainy' | 'windy' | 'snowy'

interface GoalItem {
  id: string
  text: string
  completed: boolean
}

interface OpenJournalSpreadProps {
  onClose?: () => void
  className?: string
  textStyle?: JournalTextStyle
}

export function OpenJournalSpread({
  className = '',
  textStyle
}: OpenJournalSpreadProps) {
  const [weather, setWeather] = useState<WeatherType>('sunny')
  const [isWeatherPickerOpen, setIsWeatherPickerOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string>(defaultPhoto)
  const [topic, setTopic] = useState('')
  const [isEditingTopic, setIsEditingTopic] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string>(() => {
    return localStorage.getItem('daybook_journal_mood') || 'Peaceful'
  })
  const [goals, setGoals] = useState<GoalItem[]>(() => {
    try {
      const saved = localStorage.getItem('daybook_journal_goals')
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })
  const [newGoalText, setNewGoalText] = useState('')
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [entryHtml, setEntryHtml] = useState(() => {
    return (
      localStorage.getItem('daybook_journal_entry_html') ||
      localStorage.getItem('daybook_journal_entry') ||
      ''
    )
  })
  const [entryText, setEntryText] = useState(() => {
    return localStorage.getItem('daybook_journal_entry') || ''
  })
  const [locationText, setLocationText] = useState(() => {
    return localStorage.getItem('daybook_journal_location') || ''
  })

  const editorRef = useRef<HTMLDivElement>(null)
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
    if (editorRef.current && !editorRef.current.innerHTML && entryHtml) {
      editorRef.current.innerHTML = entryHtml
    }
  }, [])

  function handleInput() {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    const text = editorRef.current.innerText || ''
    setEntryHtml(html)
    setEntryText(text)
    localStorage.setItem('daybook_journal_entry_html', html)
    localStorage.setItem('daybook_journal_entry', text)
  }

  function handleEditorPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    handleInput()
  }

  function expandRangeToWord(range: Range) {
    const node = range.startContainer
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      let start = range.startOffset
      let end = range.startOffset

      while (start > 0 && /\S/.test(text[start - 1])) {
        start--
      }
      while (end < text.length && /\S/.test(text[end])) {
        end++
      }

      if (start < end) {
        range.setStart(node, start)
        range.setEnd(node, end)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    }
  }

  function updateToolbarFromSelection() {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const node = selection.anchorNode
    const element =
      node?.nodeType === Node.TEXT_NODE
        ? node.parentElement
        : (node as HTMLElement | null)
    if (!element || !editorRef.current?.contains(element)) return

    const computed = window.getComputedStyle(element)

    let fontFamily: JournalTextStyle['fontFamily'] = 'sans'
    const ff = computed.fontFamily.toLowerCase()
    if (ff.includes('cedarville') || ff.includes('cursive')) {
      fontFamily = 'cursive'
    } else if (ff.includes('serif') && !ff.includes('sans')) {
      fontFamily = 'serif'
    } else if (ff.includes('mono')) {
      fontFamily = 'mono'
    }

    const fontSize = parseInt(computed.fontSize) || 13
    const isBold =
      computed.fontWeight === '700' ||
      computed.fontWeight === 'bold' ||
      parseInt(computed.fontWeight) >= 600
    const isItalic = computed.fontStyle === 'italic'
    const isUnderline =
      computed.textDecorationLine?.includes('underline') ||
      computed.textDecoration?.includes('underline') ||
      false

    window.dispatchEvent(
      new CustomEvent('journal-style-sync', {
        detail: {
          fontFamily,
          fontSize,
          fontColor: computed.color,
          isBold,
          isItalic,
          isUnderline
        }
      })
    )
  }

  function applyInlineStyle(styleUpdater: (span: HTMLElement) => void) {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    let range = selection.getRangeAt(0)

    if (!editorRef.current?.contains(range.commonAncestorContainer)) {
      editorRef.current?.focus()
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return
      range = sel.getRangeAt(0)
    }

    if (range.collapsed) {
      expandRangeToWord(range)
    }

    if (range.collapsed) return

    const span = document.createElement('span')
    styleUpdater(span)

    try {
      const fragment = range.extractContents()
      span.appendChild(fragment)
      range.insertNode(span)

      const newRange = document.createRange()
      newRange.selectNodeContents(span)
      selection.removeAllRanges()
      selection.addRange(newRange)
    } catch {}

    handleInput()
    updateToolbarFromSelection()
  }

  function resetSelectionFormatting() {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    let range = selection.getRangeAt(0)
    if (range.collapsed) {
      expandRangeToWord(range)
    }
    if (range.collapsed) return
    const text = range.toString()
    range.deleteContents()
    const textNode = document.createTextNode(text)
    range.insertNode(textNode)
    const newRange = document.createRange()
    newRange.selectNodeContents(textNode)
    selection.removeAllRanges()
    selection.addRange(newRange)
    handleInput()
    updateToolbarFromSelection()
  }

  useEffect(() => {
    function handleJournalFormat(e: Event) {
      const { action, value } =
        (e as CustomEvent<{ action: string; value?: any }>).detail || {}
      if (!action) return

      if (action === 'font') {
        const fontMap: Record<string, string> = {
          sans: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
          serif: 'ui-serif, Georgia, Cambria, serif',
          cursive: '"Cedarville Cursive", cursive',
          mono: 'ui-monospace, SFMono-Regular, Menlo, monospace'
        }
        applyInlineStyle((el) => {
          el.style.fontFamily = fontMap[value] || value
        })
      } else if (action === 'size') {
        applyInlineStyle((el) => {
          el.style.fontSize = `${value}px`
        })
      } else if (action === 'color') {
        applyInlineStyle((el) => {
          el.style.color = value
        })
      } else if (action === 'bold') {
        applyInlineStyle((el) => {
          const currentWeight = window.getComputedStyle(el).fontWeight
          el.style.fontWeight =
            currentWeight === '700' || currentWeight === 'bold' || parseInt(currentWeight) >= 600
              ? '400'
              : '700'
        })
      } else if (action === 'italic') {
        applyInlineStyle((el) => {
          const currentStyle = window.getComputedStyle(el).fontStyle
          el.style.fontStyle = currentStyle === 'italic' ? 'normal' : 'italic'
        })
      } else if (action === 'underline') {
        applyInlineStyle((el) => {
          const currentDecor = window.getComputedStyle(el).textDecoration
          el.style.textDecoration = currentDecor.includes('underline') ? 'none' : 'underline'
        })
      } else if (action === 'align') {
        if (editorRef.current) {
          editorRef.current.style.textAlign = value
          handleInput()
        }
      } else if (action === 'reset') {
        resetSelectionFormatting()
      }
    }

    window.addEventListener('journal-format', handleJournalFormat)
    return () => window.removeEventListener('journal-format', handleJournalFormat)
  }, [])

  useEffect(() => {
    localStorage.setItem('daybook_journal_location', locationText)
  }, [locationText])

  useEffect(() => {
    localStorage.setItem('daybook_journal_mood', selectedMood)
  }, [selectedMood])

  useEffect(() => {
    try {
      localStorage.setItem('daybook_journal_goals', JSON.stringify(goals))
    } catch {}
  }, [goals])

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
    { id: 'Happy', label: 'Happy', emoji: '😊', category: 'positive' },
    { id: 'Peaceful', label: 'Peaceful', emoji: '🌿', category: 'positive' },
    { id: 'Grateful', label: 'Grateful', emoji: '🙏', category: 'positive' },
    { id: 'Excited', label: 'Excited', emoji: '✨', category: 'positive' },
    { id: 'Loved', label: 'Loved', emoji: '🥰', category: 'positive' },
    { id: 'Energetic', label: 'Energetic', emoji: '⚡', category: 'positive' },
    { id: 'Calm', label: 'Calm', emoji: '🕊️', category: 'positive' },
    { id: 'Sad', label: 'Sad', emoji: '😢', category: 'negative' },
    { id: 'Lonely', label: 'Lonely', emoji: '🥺', category: 'negative' },
    { id: 'Anxious', label: 'Anxious', emoji: '😰', category: 'negative' },
    { id: 'Stressed', label: 'Stressed', emoji: '😫', category: 'negative' },
    { id: 'Tired', label: 'Tired', emoji: '🥱', category: 'negative' },
    { id: 'Frustrated', label: 'Frustrated', emoji: '😤', category: 'negative' },
    { id: 'Overwhelmed', label: 'Overwhelmed', emoji: '🌊', category: 'negative' }
  ]

  const ActiveWeatherIcon =
    weatherOptions.find((w) => w.type === weather)?.icon || Sun

  return (
    <div
      className={`relative w-full max-w-[600px] sm:max-w-[680px] md:max-w-[760px] lg:max-w-[800px] h-[410px] sm:h-[465px] md:h-[515px] lg:h-[545px] rounded-[22px] sm:rounded-[26px] bg-[#8dc0f8] p-1.5 sm:p-2 shadow-[2px_6px_20px_rgba(20,45,80,0.22)] border border-white/40 select-none ${className}`}
    >
      <div className="relative w-full h-full flex flex-col md:flex-row rounded-[18px] sm:rounded-[22px] overflow-hidden bg-transparent shadow-sm">
        <div className="flex-1 h-full bg-[#FAF9F5] rounded-t-[18px] md:rounded-t-none md:rounded-l-[20px] border-r-0 md:border-r border-slate-200/60 p-2.5 sm:p-3.5 flex flex-col justify-between relative shadow-[inset_-4px_0_8px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="space-y-2 sm:space-y-2.5 flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between flex-shrink-0">
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

            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative group/photo w-36 sm:w-40 md:w-44 lg:w-48 bg-white rounded-2xl p-2 pb-2.5 shadow-sm border border-slate-200/60 transition-transform duration-200 hover:-rotate-1">
                <div className="relative w-full h-20 sm:h-24 md:h-26 lg:h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/40">
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

            <div className="space-y-1 flex-shrink-0">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                Today&apos;s Mood
              </span>
              <div className="flex flex-wrap items-center gap-1 py-0.5">
                {moods.map((m) => {
                  const isSelected = selectedMood === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMood(m.id)}
                      className={`text-[9.5px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? m.category === 'negative'
                            ? 'bg-slate-100 border-slate-400 text-slate-800 font-semibold shadow-2xs'
                            : 'bg-[#eff6fc] border-[#6eafe9] text-[#4f8ee6] font-semibold shadow-2xs'
                          : 'bg-white border-slate-200/70 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs">{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1 flex-1 min-h-0 flex flex-col pt-0.5">
              <div className="flex items-center justify-between flex-shrink-0">
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

              {isAddingGoal && (
                <div className="flex items-center gap-1 pt-0.5 pb-1 flex-shrink-0">
                  <input
                    type="text"
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addGoal()
                      if (e.key === 'Escape') setIsAddingGoal(false)
                    }}
                    placeholder="Add todays goals here..."
                    autoFocus
                    className="flex-1 text-[10px] px-2 py-0.5 rounded bg-white border border-[#6eafe9] text-slate-700 focus:outline-none placeholder:text-slate-400 placeholder:italic"
                  />
                  <button
                    type="button"
                    onClick={addGoal}
                    className="px-2 py-0.5 text-[10px] rounded bg-[#6eafe9] text-white font-medium cursor-pointer hover:bg-[#5b9fe0] transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="space-y-1 overflow-y-auto pr-0.5 scrollbar-none flex-1 min-h-[50px] max-h-[120px] sm:max-h-[145px] md:max-h-[165px]">
                {goals.length === 0 && !isAddingGoal && (
                  <button
                    type="button"
                    onClick={() => setIsAddingGoal(true)}
                    className="w-full flex items-center justify-between gap-1.5 p-1 sm:p-1.5 rounded-md bg-white/70 border border-dashed border-slate-300 hover:border-[#6eafe9] hover:bg-[#eff6fc]/40 text-slate-400 hover:text-[#4f8ee6] transition-all cursor-pointer group/placeholder"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-3 h-3 rounded border border-dashed border-slate-300 group-hover/placeholder:border-[#6eafe9] flex items-center justify-center flex-shrink-0" />
                      <span className="text-[10px] italic">
                        Add todays goals here
                      </span>
                    </div>
                    <Plus className="w-2.5 h-2.5 opacity-60 group-hover/placeholder:opacity-100" />
                  </button>
                )}

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
              </div>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-center gap-1.5 text-center flex-shrink-0">
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
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 space-y-1">
              <span className="text-[9px] font-medium text-slate-400 italic">
                ✍️ Write your thoughts, mood, and reflections:
              </span>

              <div className="relative w-full flex-1 rounded-xl bg-white/70 border border-slate-200/50 p-2 sm:p-2.5 overflow-hidden flex flex-col">
                {(!entryText || entryText.trim() === '') && (
                  <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 right-2 sm:right-2.5 text-xs sm:text-[13px] text-slate-400 pointer-events-none italic leading-[24px] select-none">
                    What happened today? How did the day go? What goals could be done and not done...
                  </div>
                )}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleInput}
                  onPaste={handleEditorPaste}
                  onSelect={updateToolbarFromSelection}
                  onMouseUp={updateToolbarFromSelection}
                  onKeyUp={updateToolbarFromSelection}
                  className="w-full flex-1 bg-transparent leading-[24px] focus:outline-none overflow-y-auto scrollbar-none text-xs sm:text-[13px] text-slate-700 font-sans"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(transparent, transparent 23px, #e8edf3 23px, #e8edf3 24px)',
                    lineHeight: '24px',
                    minHeight: '100%',
                    wordBreak: 'break-word',
                    textAlign: textStyle?.textAlign || 'left'
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
