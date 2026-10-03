import { useState, useEffect } from 'react'
import { Headphones, Copy, Check, Heart } from 'lucide-react'

export interface SavedQuote {
  id: string
  title: string
  text: string
  time: string
}

const defaultQuotes: SavedQuote[] = [
  {
    id: 'quote-savor-moment',
    title: 'Savor the Moment',
    text: 'I slow down to hear the flowers bloom and feel the gentle touch of the breeze.',
    time: '10:05 PM'
  }
]

export function LibraryView() {
  const [quotes, setQuotes] = useState<SavedQuote[]>(() => {
    try {
      const saved = localStorage.getItem('daybook_saved_quotes')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
      localStorage.setItem('daybook_saved_quotes', JSON.stringify(defaultQuotes))
    } catch (e) {
      void e
    }
    return defaultQuotes
  })

  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    function handleQuotesUpdated() {
      try {
        const saved = localStorage.getItem('daybook_saved_quotes')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setQuotes(parsed)
          }
        } else {
          setQuotes([])
        }
      } catch (e) {
        void e
      }
    }

    window.addEventListener('daybook_quotes_updated', handleQuotesUpdated)
    window.addEventListener('storage', handleQuotesUpdated)
    return () => {
      window.removeEventListener('daybook_quotes_updated', handleQuotesUpdated)
      window.removeEventListener('storage', handleQuotesUpdated)
    }
  }, [])

  function handleCopy(quote: SavedQuote) {
    navigator.clipboard.writeText(quote.text)
    setCopiedId(quote.id)
    setTimeout(() => {
      setCopiedId(null)
    }, 1500)
  }

  function handleRemoveQuote(id: string) {
    const updated = quotes.filter((q) => q.id !== id)
    setQuotes(updated)
    try {
      localStorage.setItem('daybook_saved_quotes', JSON.stringify(updated))
      window.dispatchEvent(new Event('daybook_quotes_updated'))
    } catch (e) {
      void e
    }
  }

  return (
    <div className="w-full flex flex-col justify-between space-y-4 max-h-[380px] sm:max-h-[420px] overflow-y-auto pr-1 scrollbar-none">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
            Saved Quotes
          </h3>
          <span className="text-[11px] font-semibold text-[#4f8ee6]">
            {quotes.length} {quotes.length === 1 ? 'Quote' : 'Quotes'}
          </span>
        </div>

        {quotes.length === 0 ? (
          <div className="bg-[#FAF9F5] rounded-2xl border border-dashed border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-400">
              No saved quotes yet. Click the heart on daily quotes to save them here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {quotes.map((quote) => {
              const isCopied = copiedId === quote.id
              return (
                <div
                  key={quote.id}
                  className="bg-[#FAF9F5] rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Headphones className="w-3.5 h-3.5 text-[#4f8ee6]" />
                      <span className="text-xs font-bold text-[#1a2b49]">
                        {quote.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {quote.time}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-slate-700 leading-snug text-center py-1 px-2 italic">
                    &ldquo;{quote.text}&rdquo;
                  </p>

                  <div className="flex items-center justify-center gap-4 pt-1 text-slate-400 border-t border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => handleCopy(quote)}
                      className="hover:text-[#4f8ee6] transition-colors p-1 cursor-pointer flex items-center gap-1 text-[11px]"
                      title="Copy quote"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuote(quote.id)}
                      className="text-rose-500 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      title="Saved in Library (click to remove)"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
