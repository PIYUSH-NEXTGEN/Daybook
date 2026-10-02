import { useState, useRef, useEffect } from 'react'
import { ChevronDown, PenLine, Pencil, ArrowRight } from 'lucide-react'
import logo from './assets/images/logo-nobg.webp'
import { JournalBook } from './components/JournalBook'

const navItems = ['Home', 'Journal', 'About'] as const
type NavItem = (typeof navItems)[number]

type TimePhase = 'sun' | 'sunset' | 'moon'

function getTimeInfo(date: Date): { greeting: string; phase: TimePhase } {
  const hour = date.getHours()

  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good morning,', phase: 'sun' }
  }
  if (hour >= 12 && hour < 17) {
    return { greeting: 'Good afternoon,', phase: 'sun' }
  }
  return { greeting: 'Good evening,', phase: 'moon' }
}

function renderTimeIcon(phase: TimePhase) {
  if (phase === 'sun') {
    return (
      <svg viewBox="0 0 48 48" className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0" fill="none">
        <circle cx="24" cy="24" r="11" fill="url(#sun-grad)" />
        <path
          d="M24 4V8M24 40V44M4 24H8M40 24H44M9.86 9.86L12.69 12.69M35.31 35.31L38.14 38.14M9.86 38.14L12.69 35.31M35.31 12.69L38.14 9.86"
          stroke="#f6ad55"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="sun-grad" x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fbd38d" />
            <stop offset="1" stopColor="#ed8936" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  if (phase === 'sunset') {
    return (
      <svg viewBox="0 0 48 48" className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0" fill="none">
        <defs>
          <linearGradient id="sunset-grad" x1="16" y1="14" x2="32" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fca5a5" />
            <stop offset="0.5" stopColor="#f97316" />
            <stop offset="1" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        <path
          d="M13 28C13 21.9249 17.9249 17 24 17C30.0751 17 35 21.9249 35 28H13Z"
          fill="url(#sunset-grad)"
        />
        <path d="M24 7V12M12 14.5L15.5 18M36 14.5L32.5 18M7 28H10M38 28H41" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
        <path d="M6 33H42M11 38H37M17 43H31" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0" fill="none">
      <defs>
        <linearGradient id="moon-grad" x1="12" y1="8" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93c5fd" />
          <stop offset="1" stopColor="#4f8ee6" />
        </linearGradient>
      </defs>
      <path
        d="M28 8C19.1634 8 12 15.1634 12 24C12 32.8366 19.1634 40 28 40C31.5 40 34.73 38.88 37.38 36.98C30.63 35.8 25.5 29.8 25.5 22.5C25.5 16.2 29.5 10.8 35.2 8.8C32.95 8.28 30.53 8 28 8Z"
        fill="url(#moon-grad)"
      />
      <circle cx="37" cy="14" r="1.8" fill="#fbd38d" />
      <circle cx="40" cy="22" r="1.3" fill="#fbd38d" />
    </svg>
  )
}

function App() {
  const [activePage, setActivePage] = useState<NavItem>('Home')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const userMenuRef = useRef<HTMLDivElement>(null)

  const timeInfo = getTimeInfo(currentTime)
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#464e5c] flex flex-col">
      <header className="relative px-6 py-5 sm:px-8 sm:py-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-4">
        <a
          href="/"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 sm:gap-2 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6eafe9] rounded-lg"
        >
          <img
            src={logo}
            alt="DayBook logo"
            width={64}
            height={52}
            fetchPriority="high"
            className="h-14 sm:h-16 w-auto object-contain select-none"
          />
          <span className="text-3xl sm:text-4xl font-bold tracking-tight select-none">
            <span className="text-[#464e5c]">Day</span>
            <span className="text-[#6eafe9]">Book</span>
          </span>
        </a>

        <nav className="order-3 sm:order-2 w-full sm:w-auto flex justify-center items-center gap-6 sm:gap-8 text-sm sm:text-base sm:absolute sm:left-1/2 sm:-translate-x-1/2">
          {navItems.map((item) => {
            const isActive = activePage === item
            return (
              <button
                key={item}
                type="button"
                onClick={() => setActivePage(item)}
                className={`relative py-1 font-medium transition-all duration-200 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eafe9]/50 rounded-sm ${
                  isActive
                    ? 'text-[#6eafe9] font-semibold'
                    : 'text-[#464e5c] hover:text-[#6eafe9]'
                }`}
              >
                <span className="inline-block transition-transform duration-150 group-hover:-translate-y-0.5">
                  {item}
                </span>
                <span
                  className={`absolute -bottom-1 left-0 h-[2.5px] bg-[#6eafe9] rounded-full transition-all duration-300 ease-out ${
                    isActive
                      ? 'w-full opacity-100'
                      : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-40'
                  }`}
                />
              </button>
            )
          })}
        </nav>

        <div ref={userMenuRef} className="order-2 sm:order-3 relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-full hover:bg-black/5 transition-all duration-200 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eafe9]"
          >
            <div className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm overflow-hidden flex-shrink-0 bg-[#e2edf9]">
              <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
                <rect width="36" height="36" fill="#ddecfa" />
                <circle cx="26" cy="11" r="3.5" fill="#fbd38d" />
                <path d="M0 24L9 15L19 25L27 17L36 27V36H0V24Z" fill="#9ecbf7" />
                <path d="M0 28L11 20L23 30L29 23L36 29V36H0V28Z" fill="#75b3ee" />
                <path d="M0 31C10 29 20 33 36 30V36H0V31Z" fill="#8ecf8e" />
              </svg>
            </div>
            <span className="font-semibold text-sm sm:text-base text-[#464e5c] group-hover:text-slate-900">
              User
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#464e5c] transition-transform duration-200 ${
                isUserMenuOpen ? 'rotate-180 text-[#6eafe9]' : 'group-hover:text-slate-900'
              }`}
            />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 sm:w-72 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full ring-2 ring-[#6eafe9]/30 shadow-sm overflow-hidden flex-shrink-0 bg-[#e2edf9]">
                  <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
                    <rect width="36" height="36" fill="#ddecfa" />
                    <circle cx="26" cy="11" r="3.5" fill="#fbd38d" />
                    <path d="M0 24L9 15L19 25L27 17L36 27V36H0V24Z" fill="#9ecbf7" />
                    <path d="M0 28L11 20L23 30L29 23L36 29V36H0V28Z" fill="#75b3ee" />
                    <path d="M0 31C10 29 20 33 36 30V36H0V31Z" fill="#8ecf8e" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-800 text-sm truncate">
                    User
                  </h3>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    setActivePage('Journal')
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#6eafe9] hover:bg-[#5b9fe0] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-[#6eafe9]/20 hover:shadow-lg hover:shadow-[#6eafe9]/30 transition-all duration-200 cursor-pointer"
                >
                  <PenLine className="w-4 h-4" />
                  <span>Start Writing</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-start pt-5 sm:pt-10 md:pt-12 px-6 sm:px-12 md:px-16 lg:px-20 pb-12">
        {activePage === 'Home' && (
          <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-6 animate-in fade-in duration-500">
            <div className="w-full lg:w-[32%] flex flex-col items-start -translate-y-3 sm:-translate-y-5 lg:-translate-y-7">
              <div className="flex items-center gap-5 sm:gap-6 mb-8 sm:mb-10">
                {renderTimeIcon(timeInfo.phase)}
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xl sm:text-2xl md:text-3xl font-medium">
                    {timeInfo.greeting}
                  </span>
                  <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1a2b49]">
                    User
                  </span>
                </div>
              </div>

              <div className="relative pl-8 sm:pl-10 pr-4 py-2">
                <span className="absolute -top-4 sm:-top-6 left-0 text-5xl sm:text-6xl md:text-7xl font-serif text-[#6eafe9]/70 select-none">
                  &ldquo;
                </span>
                <p className="text-2xl sm:text-3xl md:text-4xl text-slate-700 font-normal leading-relaxed tracking-wide inline font-quote">
                  A small step today is still progress.
                </p>
                <span className="inline-block text-5xl sm:text-6xl md:text-7xl font-serif text-[#6eafe9]/70 select-none ml-2 align-middle">
                  &rdquo;
                </span>
              </div>
            </div>

            <div className="w-full lg:w-[36%] flex flex-col items-center justify-center -translate-y-4 sm:-translate-y-6 lg:-translate-y-8 py-2">
              <JournalBook onClick={() => setActivePage('Journal')} />
            </div>

            <div className="w-full lg:w-[32%] flex flex-col items-start lg:pl-6">
              <span className="text-sm sm:text-base font-medium text-slate-400 mb-2">
                {formattedDate}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a2b49] mb-3">
                Ready to write today&apos;s chapter?
              </h2>
              <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-6 max-w-md">
                Capture your thoughts, reflect on your day, and let your future self be proud.
              </p>
              <button
                type="button"
                onClick={() => setActivePage('Journal')}
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#6eafe9] hover:bg-[#5b9fe0] text-white font-semibold text-base rounded-2xl shadow-lg shadow-[#6eafe9]/25 hover:shadow-xl hover:shadow-[#6eafe9]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                <Pencil className="w-5 h-5" />
                <span>Open Journal</span>
                <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}

        {activePage === 'Journal' && (
          <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-12 py-6 animate-in fade-in duration-500">
            <div className="flex-1 w-full bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 p-8 sm:p-12">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#6eafe9] uppercase">
                    Today&apos;s Entry
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1a2b49] mt-1">
                    {formattedDate}
                  </h2>
                </div>
              </div>
              <div className="py-6">
                <textarea
                  placeholder="What's on your mind today? Write freely..."
                  className="w-full h-64 p-4 text-base sm:text-lg text-slate-700 bg-[#FAF9F5]/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6eafe9]/50 resize-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center lg:w-80 flex-shrink-0 transition-transform duration-700 ease-out">
              <JournalBook />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

