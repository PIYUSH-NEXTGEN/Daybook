import { useState, useRef, useEffect } from 'react'
import { ArrowUp, Loader2, RotateCcw, Bot } from 'lucide-react'
import { queryAI, type AiQueryResponse } from '../lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  query?: AiQueryResponse
  isError?: boolean
}

const suggestions = [
  'What patterns do you notice in my thoughts?',
  'Reflect on my mood and emotional tone',
  'What habits or struggles kept showing up?',
  'Give me a thought-provoking prompt for today',
]

export function AnalyticsAIView() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idCounterRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  function nextId() {
    idCounterRef.current += 1
    return String(idCounterRef.current)
  }

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function handleSend(textToSend?: string) {
    const text = (textToSend ?? prompt).trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: nextId(),
      role: 'user',
      content: text,
    }

    setMessages((prev) => [...prev, userMessage])
    setPrompt('')
    setIsLoading(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++requestIdRef.current

    try {
      const result = await queryAI(text, undefined, controller.signal)
      if (requestId !== requestIdRef.current) return
      const assistantMessage: Message = {
        id: nextId(),
        role: 'assistant',
        content: result.displayText,
        query: result,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      if (requestId !== requestIdRef.current || controller.signal.aborted) return
      const assistantMessage: Message = {
        id: nextId(),
        role: 'assistant',
        content: err instanceof Error ? err.message : 'DayBook could not answer that.',
        isError: true,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false)
        abortRef.current = null
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || (e as unknown as { keyCode?: number }).keyCode === 229) {
        return
      }
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col justify-between min-h-[340px] sm:min-h-[370px] max-h-[420px] sm:max-h-[450px]">
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-none space-y-4 py-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-6">
            <h3 className="text-lg sm:text-xl font-bold text-[#1a2b49] mb-1">
              Ask DayBook AI
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
              Explore patterns in your thoughts, reflect on recurring moods, or get personalized journaling guidance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  className="text-left text-xs p-3 rounded-xl bg-[#FAF9F5] border border-slate-200/70 hover:border-[#6eafe9]/60 hover:bg-[#eff6fc] text-slate-700 transition-all cursor-pointer group"
                >
                  <span className="group-hover:text-[#4f8ee6] transition-colors">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="flex justify-end pb-1">
              <button
                type="button"
                onClick={() => setMessages([])}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#6eafe9] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Reflection</span>
              </button>
            </div>

            {messages.map((msg) => {
              const reflection = msg.query?.type === 'reflection' ? msg.query.answer : null
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-[#eff6fc] border border-[#6eafe9]/30 flex items-center justify-center text-[#4f8ee6] flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed select-text ${
                      msg.role === 'user'
                        ? 'bg-[#1a2b49] text-white rounded-br-xs shadow-xs whitespace-pre-wrap'
                        : msg.isError
                          ? 'bg-rose-50 border border-rose-200/70 text-rose-800 rounded-bl-xs'
                          : 'bg-[#FAF9F5] border border-slate-100 text-slate-700 rounded-bl-xs'
                    }`}
                  >
                    {reflection === null ? (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    ) : (
                      <div className="space-y-2.5">
                        <p className="whitespace-pre-wrap">{reflection.summary}</p>

                        {reflection.observations.length > 0 && (
                          <ul className="space-y-2 pt-0.5">
                            {reflection.observations.map((observation, index) => (
                              <li key={index} className="border-l-2 border-[#6eafe9]/40 pl-2.5">
                                <p className="font-semibold text-[#1a2b49]">{observation.title}</p>
                                <p className="text-slate-600 mt-0.5">{observation.detail}</p>
                                {observation.evidence.length > 0 && (
                                  <ul className="mt-1 space-y-0.5">
                                    {observation.evidence.map((item, itemIndex) => (
                                      <li key={itemIndex} className="text-[11px] text-slate-400">
                                        <span className="font-medium">{item.date}</span> {item.excerpt}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        {reflection.encouragement && (
                          <p className="text-slate-600">{reflection.encouragement}</p>
                        )}

                        {reflection.nextStep && (
                          <p className="text-[#4f8ee6] font-medium">
                            Next step: {reflection.nextStep}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-start justify-start">
                <div className="w-7 h-7 rounded-lg bg-[#eff6fc] border border-[#6eafe9]/30 flex items-center justify-center text-[#4f8ee6] flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#FAF9F5] border border-slate-100 rounded-2xl rounded-bl-xs px-4 py-3 text-xs sm:text-sm text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4f8ee6]" />
                  <span>Reflecting with Gemma 3:4B...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="pt-3">
        <div className="w-full bg-[#212121] rounded-full p-1.5 pl-5 pr-2 flex items-center gap-2 shadow-lg border border-white/5 transition-all focus-within:ring-2 focus-within:ring-[#6eafe9]/50">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            disabled={isLoading}
            className="flex-1 bg-transparent text-white placeholder-zinc-400 text-sm sm:text-base outline-none border-none focus:outline-none focus:ring-0 select-text"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!prompt.trim() || isLoading}
            aria-label="Send prompt"
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
              prompt.trim() && !isLoading
                ? 'bg-[#10a37f] hover:bg-[#0e906f] text-white shadow-md cursor-pointer hover:scale-105 active:scale-95'
                : 'bg-zinc-700/60 text-zinc-400 opacity-40 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
        <p className="text-[11px] sm:text-xs text-center text-slate-400 mt-2 font-medium tracking-wide select-none">
          Powered by Gemma 3:4B. Reflections run locally with Ollama.
        </p>
      </div>
    </div>
  )
}
