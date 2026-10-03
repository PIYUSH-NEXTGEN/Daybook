import { useState, useRef, useEffect } from 'react'
import {
  Type,
  ALargeSmall,
  Palette,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  RotateCcw,
  Check,
  Plus,
  Minus
} from 'lucide-react'

export interface JournalTextStyle {
  fontFamily: 'sans' | 'serif' | 'cursive' | 'mono'
  fontSize: number
  fontColor: string
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
  textAlign: 'left' | 'center' | 'justify'
}

export const defaultTextStyle: JournalTextStyle = {
  fontFamily: 'sans',
  fontSize: 13,
  fontColor: '#334155',
  isBold: false,
  isItalic: false,
  isUnderline: false,
  textAlign: 'left'
}

interface JournalToolbarProps {
  textStyle: JournalTextStyle
  onUpdateTextStyle: (updater: (prev: JournalTextStyle) => JournalTextStyle) => void
  className?: string
}

function dispatchJournalFormat(detail: { action: string; value?: string | number }) {
  window.dispatchEvent(new CustomEvent('journal-format', { detail }))
}

export function JournalToolbar({
  textStyle,
  onUpdateTextStyle,
  className = ''
}: JournalToolbarProps) {
  const [activePopup, setActivePopup] = useState<'font' | 'size' | 'color' | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setActivePopup(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleSync(e: Event) {
      const custom = e as CustomEvent<Partial<JournalTextStyle>>
      if (custom.detail) {
        onUpdateTextStyle((prev) => ({ ...prev, ...custom.detail }))
      }
    }
    window.addEventListener('journal-style-sync', handleSync)
    return () => window.removeEventListener('journal-style-sync', handleSync)
  }, [onUpdateTextStyle])

  const fontOptions: { id: JournalTextStyle['fontFamily']; label: string; sample: string; className: string }[] = [
    { id: 'sans', label: 'Modern Sans', sample: 'Aa', className: 'font-sans' },
    { id: 'serif', label: 'Editorial Serif', sample: 'Aa', className: 'font-serif' },
    { id: 'cursive', label: 'Handwritten', sample: 'Aa', className: 'font-quote text-base' },
    { id: 'mono', label: 'Typewriter', sample: 'Aa', className: 'font-mono' }
  ]

  const inkColors = [
    { label: 'Slate Ink', value: '#334155' },
    { label: 'Obsidian', value: '#0f172a' },
    { label: 'Ocean Blue', value: '#2563eb' },
    { label: 'Forest Green', value: '#059669' },
    { label: 'Warm Amber', value: '#b45309' },
    { label: 'Rose Berry', value: '#e11d48' },
    { label: 'Deep Violet', value: '#7c3aed' },
    { label: 'Sepia', value: '#854d0e' }
  ]

  const sizePresets = [
    { label: 'Small', value: 11 },
    { label: 'Normal', value: 13 },
    { label: 'Large', value: 15 },
    { label: 'X-Large', value: 18 }
  ]

  function togglePopup(popup: 'font' | 'size' | 'color') {
    setActivePopup((prev) => (prev === popup ? null : popup))
  }

  function cycleAlign() {
    const nextAlign: Record<JournalTextStyle['textAlign'], JournalTextStyle['textAlign']> = {
      left: 'center',
      center: 'justify',
      justify: 'left'
    }
    const next = nextAlign[textStyle.textAlign]
    onUpdateTextStyle((prev) => ({ ...prev, textAlign: next }))
    dispatchJournalFormat({ action: 'align', value: next })
  }

  const AlignIcon =
    textStyle.textAlign === 'center'
      ? AlignCenter
      : textStyle.textAlign === 'justify'
        ? AlignJustify
        : AlignLeft

  return (
    <div
      ref={toolbarRef}
      className={`w-full md:w-20 lg:w-22 bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 py-2 md:py-4 px-2 md:px-2 grid grid-cols-4 md:flex md:flex-col items-center justify-items-center md:justify-start gap-x-1 gap-y-1.5 sm:gap-2 flex-shrink-0 relative select-none mt-1 mb-2 max-lg:[&>*]:min-w-0 ${className}`}
    >
      <div className="w-full md:relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => togglePopup('font')}
          className={`flex flex-col items-center justify-center gap-1 w-full md:w-16 py-2 rounded-2xl transition-all duration-200 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eafe9]/50 min-w-0 ${
            activePopup === 'font'
              ? 'text-[#4f8ee6] bg-[#eff6fc] shadow-xs font-semibold'
              : 'text-slate-500 hover:text-[#4f8ee6] hover:bg-slate-50 font-medium'
          }`}
          title="Choose font"
        >
          <Type className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-[11px] tracking-tight">Font</span>
        </button>

        {activePopup === 'font' && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] md:left-auto md:translate-x-0 md:bottom-auto md:right-[calc(100%+14px)] md:top-0 z-50 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 p-2.5 min-w-[170px] animate-in fade-in zoom-in-95 duration-150">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 block">
              Font Family
            </span>
            <div className="space-y-1">
              {fontOptions.map((f) => {
                const isSelected = textStyle.fontFamily === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onUpdateTextStyle((prev) => ({ ...prev, fontFamily: f.id }))
                      dispatchJournalFormat({ action: 'font', value: f.id })
                      setActivePopup(null)
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#eff6fc] text-[#4f8ee6] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className={f.className}>{f.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#4f8ee6]" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="w-full md:relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => togglePopup('size')}
          className={`flex flex-col items-center justify-center gap-1 w-full md:w-16 py-2 rounded-2xl transition-all duration-200 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eafe9]/50 min-w-0 ${
            activePopup === 'size'
              ? 'text-[#4f8ee6] bg-[#eff6fc] shadow-xs font-semibold'
              : 'text-slate-500 hover:text-[#4f8ee6] hover:bg-slate-50 font-medium'
          }`}
          title="Adjust font size"
        >
          <ALargeSmall className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-[11px] tracking-tight">{textStyle.fontSize}px</span>
        </button>

        {activePopup === 'size' && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] md:left-auto md:translate-x-0 md:bottom-auto md:right-[calc(100%+14px)] md:top-0 z-50 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 p-3 min-w-[180px] animate-in fade-in zoom-in-95 duration-150 space-y-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Font Size
            </span>

            <div className="flex items-center justify-between gap-2 px-1">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const newSize = Math.max(10, textStyle.fontSize - 1)
                  onUpdateTextStyle((prev) => ({
                    ...prev,
                    fontSize: newSize
                  }))
                  dispatchJournalFormat({ action: 'size', value: newSize })
                }}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Decrease size"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-slate-800 tabular-nums">
                {textStyle.fontSize}px
              </span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const newSize = Math.min(24, textStyle.fontSize + 1)
                  onUpdateTextStyle((prev) => ({
                    ...prev,
                    fontSize: newSize
                  }))
                  dispatchJournalFormat({ action: 'size', value: newSize })
                }}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Increase size"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
              {sizePresets.map((sp) => (
                <button
                  key={sp.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onUpdateTextStyle((prev) => ({ ...prev, fontSize: sp.value }))
                    dispatchJournalFormat({ action: 'size', value: sp.value })
                    setActivePopup(null)
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    textStyle.fontSize === sp.value
                      ? 'bg-[#eff6fc] text-[#4f8ee6] font-semibold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full md:relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => togglePopup('color')}
          className={`flex flex-col items-center justify-center gap-1 w-full md:w-16 py-2 rounded-2xl transition-all duration-200 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eafe9]/50 min-w-0 ${
            activePopup === 'color'
              ? 'text-[#4f8ee6] bg-[#eff6fc] shadow-xs font-semibold'
              : 'text-slate-500 hover:text-[#4f8ee6] hover:bg-slate-50 font-medium'
          }`}
          title="Choose text color"
        >
          <div className="relative">
            <Palette className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-1.5 ring-white"
              style={{ backgroundColor: textStyle.fontColor }}
            />
          </div>
          <span className="text-[11px] tracking-tight">Color</span>
        </button>

        {activePopup === 'color' && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] md:left-auto md:translate-x-0 md:bottom-auto md:right-[calc(100%+14px)] md:top-0 z-50 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 p-3 min-w-[190px] animate-in fade-in zoom-in-95 duration-150 space-y-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Ink Color
            </span>

            <div className="grid grid-cols-4 gap-2">
              {inkColors.map((c) => {
                const isSelected = textStyle.fontColor === c.value
                return (
                  <button
                    key={c.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onUpdateTextStyle((prev) => ({ ...prev, fontColor: c.value }))
                      dispatchJournalFormat({ action: 'color', value: c.value })
                      setActivePopup(null)
                    }}
                    title={c.label}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-110 cursor-pointer relative shadow-2xs"
                    style={{ backgroundColor: c.value }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
                  </button>
                )
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Custom</span>
              <input
                type="color"
                value={textStyle.fontColor}
                onChange={(e) => {
                  onUpdateTextStyle((prev) => ({ ...prev, fontColor: e.target.value }))
                  dispatchJournalFormat({ action: 'color', value: e.target.value })
                }}
                className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                title="Pick custom color"
              />
            </div>
          </div>
        )}
      </div>

      <div className="w-8 h-px bg-slate-100 my-0.5 hidden md:block" />

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          onUpdateTextStyle((prev) => ({ ...prev, isBold: !prev.isBold }))
          dispatchJournalFormat({ action: 'bold' })
        }}
        className={`flex flex-col items-center justify-center gap-1 w-full md:w-16 py-2 rounded-2xl transition-all duration-200 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eafe9]/50 min-w-0 ${
          textStyle.isBold
            ? 'text-[#4f8ee6] bg-[#eff6fc] shadow-xs font-semibold'
            : 'text-slate-500 hover:text-[#4f8ee6] hover:bg-slate-50 font-medium'
        }`}
        title="Toggle bold"
      >
        <Bold className="w-5 h-5 md:w-4.5 md:h-4.5" />
        <span className="text-[10px] tracking-tight">Bold</span>
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          onUpdateTextStyle((prev) => ({ ...prev, isItalic: !prev.isItalic }))
          dispatchJournalFormat({ action: 'italic' })
        }}
        className={`flex flex-col items-center justify-center gap-1 w-full md:w-16 py-2 rounded-2xl transition-all duration-200 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eafe9]/50 min-w-0 ${
          textStyle.isItalic
            ? 'text-[#4f8ee6] bg-[#eff6fc] shadow-xs font-semibold'
            : 'text-slate-500 hover:text-[#4f8ee6] hover:bg-slate-50 font-medium'
        }`}
        title="Toggle italic"
      >
        <Italic className="w-5 h-5 md:w-4.5 md:h-4.5" />
        <span className="text-[10px] tracking-tight">Italic</span>
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          onUpdateTextStyle((prev) => ({ ...prev, isUnderline: !prev.isUnderline }))
          dispatchJournalFormat({ action: 'underline' })
        }}
        className={`flex flex-col items-center justify-center gap-1 w-full md:w-16 py-2 rounded-2xl transition-all duration-200 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eafe9]/50 min-w-0 ${
          textStyle.isUnderline
            ? 'text-[#4f8ee6] bg-[#eff6fc] shadow-xs font-semibold'
            : 'text-slate-500 hover:text-[#4f8ee6] hover:bg-slate-50 font-medium'
        }`}
        title="Toggle underline"
      >
        <Underline className="w-5 h-5 md:w-4.5 md:h-4.5" />
        <span className="text-[10px] tracking-tight">Line</span>
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={cycleAlign}
        className="flex flex-col items-center justify-center gap-1 w-full md:w-16 py-2 rounded-2xl transition-all duration-200 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eafe9]/50 min-w-0 text-slate-500 hover:text-[#4f8ee6] hover:bg-slate-50 font-medium"
        title={`Align text: currently ${textStyle.textAlign}`}
      >
        <AlignIcon className="w-5 h-5 md:w-4.5 md:h-4.5" />
        <span className="text-[10px] tracking-tight capitalize">{textStyle.textAlign}</span>
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          onUpdateTextStyle(() => defaultTextStyle)
          dispatchJournalFormat({ action: 'reset' })
        }}
        className="flex flex-col items-center justify-center gap-1 w-full md:w-16 py-2 rounded-2xl transition-all duration-200 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eafe9]/50 min-w-0 text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-medium"
        title="Reset formatting to default"
      >
        <RotateCcw className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Reset</span>
      </button>
    </div>
  )
}
