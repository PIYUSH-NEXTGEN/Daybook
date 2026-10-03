import { useState, type KeyboardEvent } from 'react'
import { ArrowRight, ArrowLeft, BookOpen, Check } from 'lucide-react'
import logo from '../assets/images/logo-nobg.webp'
import sceneImg from '../assets/images/scene.webp'
import { updateCurrentProfile, type UpdateUserProfileInput, type UserProfile } from '../lib/api'

interface OnboardingViewProps {
  initialProfile?: UserProfile | null
  onComplete: (profile: UserProfile) => void
  onCancel?: () => void
}

interface QuestionConfig {
  stepIndex: number
  eyebrow: string
  title: string
  supporting: string
}

const QUESTIONS: QuestionConfig[] = [
  {
    stepIndex: 0,
    eyebrow: '01 / 07',
    title: 'What are you currently working toward?',
    supporting: "Think about the chapter of life you're in right now.",
  },
  {
    stepIndex: 1,
    eyebrow: '02 / 07',
    title: 'What are you trying to improve?',
    supporting: 'These can be habits, skills, routines, or parts of yourself.',
  },
  {
    stepIndex: 2,
    eyebrow: '03 / 07',
    title: 'What habits are you trying to build?',
    supporting: 'Small daily actions you would like to make second nature.',
  },
  {
    stepIndex: 3,
    eyebrow: '04 / 07',
    title: 'What usually gets in the way?',
    supporting: 'Being honest about obstacles helps clarify where to find balance.',
  },
  {
    stepIndex: 4,
    eyebrow: '05 / 07',
    title: 'What would an ideal day look like for you?',
    supporting: 'From waking up to winding down, describe a day that feels fulfilling.',
  },
  {
    stepIndex: 5,
    eyebrow: '06 / 07',
    title: 'How should DayBook talk to you?',
    supporting: 'Choose the tone that feels most natural when you reflect.',
  },
  {
    stepIndex: 6,
    eyebrow: '07 / 07',
    title: 'Is there anything DayBook should never assume about you?',
    supporting: 'This helps keep your reflections grounded in what you actually tell it.',
  },
]

const REFLECTION_STYLES = [
  {
    id: 'Gentle',
    title: 'Gentle',
    description: 'Warm, patient, and focused on self-compassion.',
  },
  {
    id: 'Balanced',
    title: 'Balanced',
    description: 'Thoughtful and honest, pairing empathy with clarity.',
  },
  {
    id: 'Direct',
    title: 'Direct',
    description: 'Concise and focused, straight to insights and habits.',
  },
]

export function OnboardingView({ initialProfile, onComplete, onCancel }: OnboardingViewProps) {
  const [step, setStep] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const [currentFocus, setCurrentFocus] = useState(initialProfile?.currentFocus || '')
  const [bio, setBio] = useState(initialProfile?.bio || '')
  const [motivators, setMotivators] = useState(initialProfile?.motivators || '')
  const [knownStruggles, setKnownStruggles] = useState(initialProfile?.knownStruggles || '')
  const [idealDay, setIdealDay] = useState(initialProfile?.idealDay || '')
  const [reflectionStyle, setReflectionStyle] = useState<string>(initialProfile?.reflectionStyle || 'Balanced')
  const [thingsToAvoidAssuming, setThingsToAvoidAssuming] = useState(initialProfile?.thingsToAvoidAssuming || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [occupation, setOccupation] = useState(initialProfile?.occupation || '')
  const [age, setAge] = useState<string>(initialProfile?.age ? String(initialProfile.age) : '')

  const currentQuestion = QUESTIONS[step]
  const totalSteps = QUESTIONS.length

  function handleNext() {
    if (step < totalSteps - 1) {
      setIsFading(true)
      setTimeout(() => {
        setStep((prev) => prev + 1)
        setIsFading(false)
      }, 160)
    } else {
      handleFinish()
    }
  }

  function handleBack() {
    if (step > 0) {
      setIsFading(true)
      setTimeout(() => {
        setStep((prev) => prev - 1)
        setIsFading(false)
      }, 160)
    }
  }

  async function handleFinish() {
    if (isSaving) return

    const parsedAge = age.trim() ? parseInt(age.trim(), 10) : null
    const data: UpdateUserProfileInput = {
      age: Number.isNaN(parsedAge) ? null : parsedAge,
      occupation: occupation.trim() || null,
      bio: bio.trim() || null,
      currentFocus: currentFocus.trim() || null,
      idealDay: idealDay.trim() || null,
      reflectionStyle: reflectionStyle || 'Balanced',
      motivators: motivators.trim() || null,
      knownStruggles: knownStruggles.trim() || null,
      thingsToAvoidAssuming: thingsToAvoidAssuming.trim() || null,
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const savedProfile = await updateCurrentProfile({
        ...data,
        onboardingCompleted: true,
      })
      setIsSaving(false)
      onComplete(savedProfile)
    } catch (err) {
      setIsSaving(false)
      setSaveError(
        err instanceof Error && err.message
          ? err.message
          : 'Could not save your answers. Your information is still here. Please try again.'
      )
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      handleNext()
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#464e5c] flex flex-col justify-between px-6 sm:px-12 md:px-16 lg:px-24 py-8 sm:py-10">
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col">
        <header className="flex items-center justify-between pb-6 sm:pb-8 border-b border-slate-200/60 mb-8 sm:mb-12">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="DayBook logo"
              width={36}
              height={30}
              className="h-8 w-auto object-contain select-none"
            />
            <span className="text-xl font-bold tracking-tight select-none">
              <span className="text-[#464e5c]">Day</span>
              <span className="text-[#6eafe9]">Book</span>
            </span>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              Exit to Home
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 flex-1 items-start">
          <div className="lg:col-span-8 flex flex-col min-w-0">
            <div className="flex items-center justify-between text-xs tracking-wider font-mono text-slate-400 mb-6 sm:mb-8">
              <span className="font-semibold text-slate-600">
                {String(step + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 mx-4 h-[1px] bg-slate-200 relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-[#6eafe9] transition-all duration-300 ease-out"
                  style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                />
              </div>
              <span className="text-slate-400">
                {String(totalSteps).padStart(2, '0')}
              </span>
            </div>

            <div className="mb-6 sm:mb-8">
              <span className="text-[11px] sm:text-xs tracking-widest font-semibold text-[#6eafe9] uppercase mb-2 block">
                DAYBOOK &middot; GETTING STARTED
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1a2b49] leading-tight mb-2">
                Let&apos;s get to know you
              </h1>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl">
                A little context helps DayBook understand your goals, habits, and the kind of person you&apos;re becoming.
              </p>
            </div>

            <div
              className={`transition-all duration-200 ease-out ${
                isFading
                  ? 'opacity-0 translate-y-1.5'
                  : 'opacity-100 translate-y-0'
              }`}
            >
              <div className="mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 leading-snug mb-1">
                  {currentQuestion.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {currentQuestion.supporting}
                </p>
              </div>

              {step === 0 && (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={currentFocus}
                    onChange={(e) => setCurrentFocus(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Exams, fitness, building something, personal growth..."
                    rows={4}
                    autoFocus
                    className="w-full px-5 py-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-base text-[#1a2b49] placeholder:text-slate-400 focus:outline-none focus:border-[#6eafe9] focus:ring-2 focus:ring-[#6eafe9]/30 transition-all resize-none leading-relaxed"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="A habit, a creative craft, staying calm under pressure..."
                    rows={4}
                    autoFocus
                    className="w-full px-5 py-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-base text-[#1a2b49] placeholder:text-slate-400 focus:outline-none focus:border-[#6eafe9] focus:ring-2 focus:ring-[#6eafe9]/30 transition-all resize-none leading-relaxed"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={motivators}
                    onChange={(e) => setMotivators(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Sleep earlier, exercise, study consistently..."
                    rows={4}
                    autoFocus
                    className="w-full px-5 py-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-base text-[#1a2b49] placeholder:text-slate-400 focus:outline-none focus:border-[#6eafe9] focus:ring-2 focus:ring-[#6eafe9]/30 transition-all resize-none leading-relaxed"
                  />
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={knownStruggles}
                    onChange={(e) => setKnownStruggles(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Procrastination, distractions, lack of sleep..."
                    rows={4}
                    autoFocus
                    className="w-full px-5 py-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-base text-[#1a2b49] placeholder:text-slate-400 focus:outline-none focus:border-[#6eafe9] focus:ring-2 focus:ring-[#6eafe9]/30 transition-all resize-none leading-relaxed"
                  />
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={idealDay}
                    onChange={(e) => setIdealDay(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Wake up early, study, exercise, work on my project..."
                    rows={4}
                    autoFocus
                    className="w-full px-5 py-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-base text-[#1a2b49] placeholder:text-slate-400 focus:outline-none focus:border-[#6eafe9] focus:ring-2 focus:ring-[#6eafe9]/30 transition-all resize-none leading-relaxed"
                  />
                </div>
              )}

              {step === 5 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {REFLECTION_STYLES.map((opt) => {
                    const isSelected = reflectionStyle === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setReflectionStyle(opt.id)}
                        className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-[#6eafe9]/10 border-[#6eafe9] text-[#1a2b49] shadow-xs'
                            : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <span className="font-semibold text-sm text-[#1a2b49]">
                            {opt.title}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                              isSelected
                                ? 'bg-[#6eafe9] border-[#6eafe9] text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 leading-relaxed">
                          {opt.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {step === 6 && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={thingsToAvoidAssuming}
                      onChange={(e) => setThingsToAvoidAssuming(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Anything you'd like DayBook to keep in mind..."
                      rows={3}
                      autoFocus
                      className="w-full px-5 py-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-base text-[#1a2b49] placeholder:text-slate-400 focus:outline-none focus:border-[#6eafe9] focus:ring-2 focus:ring-[#6eafe9]/30 transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-200/60 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                        Optional Context
                      </span>
                      <span className="text-xs text-slate-400">
                        Skip anytime
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                          Occupation or current role
                        </label>
                        <input
                          type="text"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          placeholder="Student, developer, writer..."
                          className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-sm text-[#1a2b49] placeholder:text-slate-400 focus:outline-none focus:border-[#6eafe9] focus:ring-2 focus:ring-[#6eafe9]/30 transition-all"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                          Age
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="e.g. 24"
                          className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-sm text-[#1a2b49] placeholder:text-slate-400 focus:outline-none focus:border-[#6eafe9] focus:ring-2 focus:ring-[#6eafe9]/30 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-8 sm:pt-10 mt-6 border-t border-slate-200/60">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : onCancel ? (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    Not now, explore DayBook first
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  {step < totalSteps - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#6eafe9] hover:bg-[#5b9fe0] text-white font-semibold text-sm rounded-2xl shadow-md shadow-[#6eafe9]/20 hover:shadow-lg hover:shadow-[#6eafe9]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFinish}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-7 py-3 bg-[#6eafe9] hover:bg-[#5b9fe0] text-white font-semibold text-sm rounded-2xl shadow-md shadow-[#6eafe9]/25 hover:shadow-lg hover:shadow-[#6eafe9]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{isSaving ? 'Saving your journal setup...' : 'Begin journaling'}</span>
                    </button>
                  )}
                </div>
              </div>

              {saveError && (
                <p className="text-xs sm:text-sm text-rose-600 font-medium mt-4">
                  {saveError}
                </p>
              )}
            </div>
          </div>

          <div className="hidden lg:flex lg:col-span-4 flex-col gap-5 sticky top-12">
            <div className="bg-white/80 rounded-3xl p-5 border border-slate-200/70 shadow-xs relative overflow-hidden">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4 bg-slate-100">
                <img
                  src={sceneImg}
                  alt="DayBook journal artwork"
                  className="w-full h-full object-cover select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />
                <div
                  className="absolute top-0 right-6 w-5 h-8 bg-[#4d92d8] shadow-sm pointer-events-none"
                  style={{
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)',
                  }}
                />
              </div>

              <div className="px-1 text-center">
                <p className="font-quote text-xl text-slate-600 leading-snug">
                  Your story begins with a single honest line.
                </p>
              </div>
            </div>

            <div className="px-2">
              <p className="text-xs text-slate-400 leading-relaxed">
                Take your time. DayBook adapts to the way you write, helping you uncover patterns and quiet clarity.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="w-full max-w-5xl mx-auto pt-8 text-center">
        <p className="text-xs text-slate-400">
          Your answers stay on this device.
        </p>
      </footer>
    </div>
  )
}

