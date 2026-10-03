import { useState, type FormEvent } from 'react'
import logo from '../assets/images/logo-nobg.webp'
import { createUser, type LocalUser } from '../lib/api'

interface FirstRunRegistrationProps {
  onCreated: (user: LocalUser) => void
  onCancel?: () => void
}

export function FirstRunRegistration({ onCreated, onCancel }: FirstRunRegistrationProps) {
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isSubmitting) return

    const trimmed = displayName.trim()
    if (!trimmed) {
      setError('Please enter a name so we know what to call you.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const user = await createUser({ displayName: trimmed })
      onCreated(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your DayBook.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#464e5c] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex flex-col items-center text-center animate-in fade-in duration-500">
        <img
          src={logo}
          alt="DayBook logo"
          width={96}
          height={78}
          className="h-20 w-auto object-contain select-none mb-4"
        />

        <span className="text-3xl sm:text-4xl font-bold tracking-tight select-none mb-8">
          <span className="text-[#464e5c]">Day</span>
          <span className="text-[#6eafe9]">Book</span>
        </span>

        <h1 className="text-4xl sm:text-5xl text-[#1a2b49] tracking-wide leading-tight mb-3">
          Welcome to DayBook
        </h1>

        <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-10">
          What should we call you?
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="text"
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value)
              if (error) setError(null)
            }}
            placeholder="Your name"
            autoFocus
            maxLength={64}
            className="w-full px-5 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs text-base text-[#1a2b49] placeholder:text-slate-400 focus:outline-none focus:border-[#6eafe9] focus:ring-2 focus:ring-[#6eafe9]/30 transition-all"
          />

          {error && (
            <p className="text-sm text-rose-600 font-medium text-left">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3.5 bg-[#6eafe9] hover:bg-[#5b9fe0] text-white font-semibold text-base rounded-2xl shadow-lg shadow-[#6eafe9]/25 hover:shadow-xl hover:shadow-[#6eafe9]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSubmitting ? 'Creating...' : 'Create DayBook'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-1 text-xs sm:text-sm font-medium text-slate-400 hover:text-[#6eafe9] transition-colors cursor-pointer"
            >
              Not now, explore DayBook first
            </button>
          )}
        </form>

        <p className="text-xs text-slate-400 leading-relaxed mt-6">
          Everything stays on this device. No account, no email, no cloud.
        </p>
      </div>
    </div>
  )
}
