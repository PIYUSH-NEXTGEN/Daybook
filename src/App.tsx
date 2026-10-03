import { useState, useRef, useEffect } from 'react'
import {
  ChevronDown,
  PenLine,
  Pencil,
  ArrowRight,
  ArrowLeft,
  Settings as SettingsIcon,
  Bookmark,
  CheckCircle2
} from 'lucide-react'
import logo from './assets/images/logo-nobg.webp'
import { InteractiveBook } from './components/InteractiveBook'
import { AboutPage } from './components/AboutPage'
import { JournalToolbar, defaultTextStyle, type JournalTextStyle } from './components/JournalToolbar'

const navItems = ['Home', 'Journal', 'About'] as const
type NavItem = (typeof navItems)[number]

type SidebarTab = 'Analytics' | 'Book' | 'Calendar' | 'Goals' | 'Library' | 'Settings'

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 20v-4" />
      <path d="M9 20v-8" />
      <path d="M14 20v-14" />
      <path d="M19 20v-10" />
    </svg>
  )
}

function BookNavIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    </svg>
  )
}

function CalendarNavIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 2v3" />
      <path d="M16 2v3" />
      <rect width="18" height="17" x="3" y="4" rx="3" />
      <path d="M3 10h18" />
    </svg>
  )
}

function GoalsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
      <path d="M19 5l-5 5" />
      <path d="M15 4h5v5" />
    </svg>
  )
}

function LibraryNavIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="13" height="13" x="8" y="8" rx="2.5" />
      <path d="M4 16c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2" />
    </svg>
  )
}

const sidebarItems = [
  { id: 'Analytics' as const, label: 'Analytics', icon: AnalyticsIcon },
  { id: 'Book' as const, label: 'Book', icon: BookNavIcon },
  { id: 'Calendar' as const, label: 'Calendar', icon: CalendarNavIcon },
  { id: 'Goals' as const, label: 'Goals', icon: GoalsIcon },
  { id: 'Library' as const, label: 'Library', icon: LibraryNavIcon },
  { id: 'Settings' as const, label: 'Settings', icon: SettingsIcon },
]

type TimePhase = 'sun' | 'sunset' | 'moon'

function getTimeInfo(date: Date): { greeting: string; phase: TimePhase } {
  const hour = date.getHours()

  if (hour >= 0 && hour < 12) {
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
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('Book')
  const [pendingSidebarTab, setPendingSidebarTab] = useState<SidebarTab | null>(null)
  const [isClosingBook, setIsClosingBook] = useState(false)
  const [isOpeningFromAbout, setIsOpeningFromAbout] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [homeTextState, setHomeTextState] = useState<'visible' | 'fading-out' | 'hidden' | 'entering'>('visible')
  const [textStyle, setTextStyle] = useState<JournalTextStyle>(() => {
    try {
      const saved = localStorage.getItem('daybook_journal_text_style')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {}
    return defaultTextStyle
  })
  const userMenuRef = useRef<HTMLDivElement>(null)
  const openingFromAboutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem('daybook_journal_text_style', JSON.stringify(textStyle))
    } catch {}
  }, [textStyle])

  useEffect(() => {
    return () => {
      if (openingFromAboutTimerRef.current) {
        clearTimeout(openingFromAboutTimerRef.current)
      }
    }
  }, [])

  function handleSelectSidebarTab(tab: SidebarTab) {
    if (tab === activeSidebarTab && !isClosingBook) return

    if (activeSidebarTab === 'Book' && tab !== 'Book' && activePage === 'Journal') {
      setIsClosingBook(true)
      setPendingSidebarTab(tab)
      setTimeout(() => {
        setActiveSidebarTab(tab)
        setPendingSidebarTab(null)
        setIsClosingBook(false)
      }, 500)
    } else {
      setActiveSidebarTab(tab)
    }
  }

  function handleOpenJournal() {
    if (activePage === 'Journal' && activeSidebarTab === 'Book' && !isOpeningFromAbout) return
    if (homeTextState === 'fading-out') return

    if (openingFromAboutTimerRef.current) {
      clearTimeout(openingFromAboutTimerRef.current)
      openingFromAboutTimerRef.current = null
    }

    if (activePage === 'Home') {
      setHomeTextState('fading-out')
      setTimeout(() => {
        setActivePage('Journal')
        setActiveSidebarTab('Book')
        setHomeTextState('hidden')
      }, 320)
    } else if (activePage === 'About') {
      setIsOpeningFromAbout(true)
      setActivePage('Journal')
      setActiveSidebarTab('Book')
      openingFromAboutTimerRef.current = setTimeout(() => {
        setIsOpeningFromAbout(false)
        openingFromAboutTimerRef.current = null
      }, 60)
    } else {
      setActivePage('Journal')
      setActiveSidebarTab('Book')
    }
  }

  function handleNavigatePage(page: NavItem) {
    if (page === activePage && !isClosingBook) {
      if (page === 'Journal' && activeSidebarTab !== 'Book') {
        setActiveSidebarTab('Book')
      }
      return
    }
    if (homeTextState === 'fading-out') return

    if (openingFromAboutTimerRef.current) {
      clearTimeout(openingFromAboutTimerRef.current)
      openingFromAboutTimerRef.current = null
      setIsOpeningFromAbout(false)
    }

    if (activePage === 'Home' && page !== 'Home') {
      if (page === 'Journal') {
        handleOpenJournal()
        return
      }
      setHomeTextState('fading-out')
      setTimeout(() => {
        setActivePage(page)
        setHomeTextState('hidden')
      }, 320)
      return
    }

    if (activePage === 'About' && page === 'Journal') {
      handleOpenJournal()
      return
    }

    if (activePage === 'Journal' && activeSidebarTab === 'Book' && page === 'Home') {
      setIsClosingBook(true)
      setHomeTextState('hidden')
      setTimeout(() => {
        setActivePage('Home')
        setIsClosingBook(false)
        setTimeout(() => {
          setHomeTextState('entering')
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setHomeTextState('visible')
            })
          })
        }, 650)
      }, 480)
      return
    }

    if (activePage === 'Journal' && activeSidebarTab === 'Book' && page !== 'Journal') {
      setIsClosingBook(true)
      setTimeout(() => {
        setActivePage(page)
        setIsClosingBook(false)
      }, 480)
      return
    }

    if (page === 'Home') {
      const isFromAbout = activePage === 'About'
      setHomeTextState('hidden')
      setActivePage('Home')
      setTimeout(() => {
        setHomeTextState('entering')
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setHomeTextState('visible')
          })
        })
      }, isFromAbout ? 100 : 650)
      return
    }

    setActivePage(page)
  }

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
    <div className={`bg-[#FAF9F5] text-[#464e5c] flex flex-col ${
      activePage === 'Home'
        ? 'min-h-screen overflow-y-auto lg:h-screen lg:max-h-screen lg:overflow-hidden scrollbar-none'
        : activePage === 'Journal' && (activeSidebarTab === 'Book' || isClosingBook)
          ? 'min-h-dvh lg:min-h-screen'
          : 'min-h-screen'
    }`}>
      <header className="relative px-4 py-3 sm:px-8 sm:py-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-2 sm:gap-y-4 flex-shrink-0">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault()
            handleNavigatePage('Home')
          }}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 sm:gap-2 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6eafe9] rounded-lg"
        >
          <img
            src={logo}
            alt="DayBook logo"
            width={64}
            height={52}
            fetchPriority="high"
            className="h-10 sm:h-16 w-auto object-contain select-none"
          />
          <span className="text-2xl sm:text-4xl font-bold tracking-tight select-none">
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
                onClick={() => handleNavigatePage(item)}
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
                    handleOpenJournal()
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

      <main className={`flex-1 min-h-0 flex flex-col px-3 sm:px-12 md:px-16 lg:px-20 overflow-x-clip w-full max-w-full ${
        activePage === 'About'
          ? 'justify-start py-6 sm:py-10 md:py-14'
          : activePage === 'Journal' && activeSidebarTab === 'Book'
            ? 'justify-start py-2 sm:py-3 lg:py-4'
            : activePage === 'Home'
              ? 'justify-start py-1 sm:py-3 lg:py-4'
              : 'justify-center py-4 sm:py-6 md:py-8'
      }`}>
        {activePage === 'About' ? (
          <AboutPage onStartWriting={handleOpenJournal} />
        ) : (
          <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between gap-5 sm:gap-6 lg:gap-8 relative max-w-full overflow-x-clip max-lg:min-h-0">
            <div
              className={`transition-opacity duration-500 ease-out max-lg:contents lg:flex lg:flex-col lg:items-start lg:min-w-0 lg:relative ${
                activePage === 'Journal'
                  ? activeSidebarTab === 'Book' || isClosingBook
                    ? 'w-full lg:w-22 flex-shrink-0 -translate-y-3 sm:-translate-y-5 lg:-translate-y-7'
                    : 'w-full lg:w-[62%] flex-shrink-0 -translate-y-3 sm:-translate-y-5 lg:-translate-y-7'
                  : 'w-full lg:w-[32%] translate-y-0'
              }`}
            >
              <div
                className={`max-lg:contents lg:flex lg:flex-col lg:items-start lg:w-full order-1 lg:order-none ${
                  homeTextState === 'visible' && activePage === 'Home'
                    ? 'opacity-100 translate-x-0 relative pointer-events-auto transition-all duration-500 ease-out'
                    : homeTextState === 'fading-out'
                      ? 'opacity-0 -translate-x-6 relative pointer-events-none transition-all duration-300 ease-out'
                      : homeTextState === 'entering'
                        ? 'opacity-0 -translate-x-6 relative pointer-events-none transition-none'
                        : 'opacity-0 -translate-x-6 absolute top-0 left-0 h-0 max-h-0 overflow-hidden pointer-events-none transition-none'
                }`}
              >
                <div className="w-full order-1 lg:order-none flex items-center gap-4 sm:gap-6 mb-5 sm:mb-10 pt-2 sm:pt-14 lg:pt-20">
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

                <div className="w-full order-3 lg:order-none relative pl-8 sm:pl-10 pr-4 py-1 mt-4 sm:mt-18 md:mt-22 lg:mt-24">
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

              <div
                className={`w-full ${
                  activePage === 'Journal'
                    ? 'opacity-100 translate-x-0 relative pointer-events-auto scale-100 transition-all duration-500 ease-out delay-[200ms]'
                    : 'opacity-0 -translate-x-6 absolute top-0 left-0 h-0 max-h-0 overflow-hidden pointer-events-none scale-98 transition-all duration-200 ease-in delay-0'
                }`}
              >
                <div className="w-full flex flex-col md:flex-row gap-4 sm:gap-5 lg:gap-6 items-start">
                  <div className="w-full md:w-20 lg:w-22 bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 py-3 sm:py-4 px-1.5 sm:px-2 flex flex-row md:flex-col items-center justify-around md:justify-start gap-1 sm:gap-2.5 md:gap-3 flex-shrink-0 overflow-x-auto scrollbar-none">
                    {sidebarItems.map(({ id, label, icon: Icon }) => {
                      const isActive = (pendingSidebarTab || activeSidebarTab) === id
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleSelectSidebarTab(id)}
                          className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-2xl transition-all duration-200 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6eafe9]/50 flex-shrink-0 ${
                            isActive
                              ? 'text-[#4f8ee6] bg-[#eff6fc] shadow-sm font-semibold'
                              : 'text-slate-500 hover:text-[#4f8ee6] hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <Icon
                            className={`w-5.5 h-5.5 transition-transform duration-200 group-hover:scale-110 ${
                              isActive ? 'text-[#4f8ee6]' : 'text-slate-400 group-hover:text-[#4f8ee6]'
                            }`}
                          />
                          <span className="text-[11px] tracking-tight">{label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {activeSidebarTab !== 'Book' && !isClosingBook && (
                    <div className="flex-1 w-full bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 p-6 sm:p-8 min-h-[460px] sm:min-h-[500px] lg:min-h-[545px] flex flex-col justify-between animate-in fade-in duration-300">
                      <div>
                        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                          <div>
                            <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#6eafe9] uppercase">
                              DayBook
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a2b49] mt-0.5">
                              {activeSidebarTab}
                            </h2>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleNavigatePage('Home')}
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-[#6eafe9] transition-colors cursor-pointer group"
                          >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                            <span>Home</span>
                          </button>
                        </div>

                      {activeSidebarTab === 'Analytics' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-3 sm:gap-4">
                            <div className="bg-[#FAF9F5] p-3.5 sm:p-4 rounded-2xl border border-slate-100">
                              <span className="text-xs font-medium text-slate-400">Streak</span>
                              <p className="text-xl sm:text-2xl font-bold text-[#1a2b49] mt-1">7 Days</p>
                              <span className="text-[11px] text-emerald-600 font-medium">+2 this week</span>
                            </div>
                            <div className="bg-[#FAF9F5] p-3.5 sm:p-4 rounded-2xl border border-slate-100">
                              <span className="text-xs font-medium text-slate-400">Entries</span>
                              <p className="text-xl sm:text-2xl font-bold text-[#1a2b49] mt-1">24</p>
                              <span className="text-[11px] text-slate-400 font-medium">This month</span>
                            </div>
                            <div className="bg-[#FAF9F5] p-3.5 sm:p-4 rounded-2xl border border-slate-100">
                              <span className="text-xs font-medium text-slate-400">Words</span>
                              <p className="text-xl sm:text-2xl font-bold text-[#1a2b49] mt-1">8,450</p>
                              <span className="text-[11px] text-[#6eafe9] font-medium">Avg 350 / entry</span>
                            </div>
                          </div>

                          <div className="bg-[#FAF9F5] p-4 sm:p-5 rounded-2xl border border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                              Weekly Activity
                            </span>
                            <div className="flex items-end justify-between gap-2 h-28 pt-4 pb-1 px-2">
                              {[
                                { day: 'Mon', h: '65%' },
                                { day: 'Tue', h: '85%' },
                                { day: 'Wed', h: '45%' },
                                { day: 'Thu', h: '95%' },
                                { day: 'Fri', h: '80%' },
                                { day: 'Sat', h: '60%' },
                                { day: 'Sun', h: '70%' },
                              ].map(({ day, h }) => (
                                <div key={day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                                  <div
                                    className="w-full max-w-[28px] bg-gradient-to-t from-[#6eafe9] to-[#99cdfb] rounded-t-lg transition-all hover:opacity-90"
                                    style={{ height: h }}
                                  />
                                  <span className="text-[11px] text-slate-400 font-medium">{day}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeSidebarTab === 'Calendar' && (
                        <div className="space-y-4">
                          <div className="bg-[#FAF9F5] p-4 sm:p-5 rounded-2xl border border-slate-100">
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                                <span key={d} className="text-xs font-semibold text-slate-400 py-1">{d}</span>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center">
                              {Array.from({ length: 31 }, (_, i) => {
                                const day = i + 1
                                const isToday = day === 2
                                const hasEntry = [1, 2, 4, 7, 8, 11, 14, 15, 18, 20, 22, 25, 28, 29].includes(day)
                                return (
                                  <div
                                    key={day}
                                    className={`py-2 text-xs sm:text-sm rounded-xl font-medium relative flex flex-col items-center justify-center transition-colors ${
                                      isToday
                                        ? 'bg-[#6eafe9] text-white font-bold shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-200/50'
                                    }`}
                                  >
                                    <span>{day}</span>
                                    {hasEntry && !isToday && (
                                      <span className="w-1 h-1 rounded-full bg-[#6eafe9] mt-0.5" />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                            <span>Highlighted: Friday, October 2, 2026</span>
                            <span className="text-[#6eafe9] font-medium">14 Entries Recorded</span>
                          </div>
                        </div>
                      )}

                      {activeSidebarTab === 'Goals' && (
                        <div className="space-y-4">
                          <div className="bg-[#FAF9F5] p-4 sm:p-5 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-[#1a2b49]">Daily Evening Reflection</span>
                              <span className="text-xs font-bold text-[#6eafe9]">6 / 7 Days</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                              <div className="h-full bg-[#6eafe9] rounded-full" style={{ width: '86%' }} />
                            </div>
                            <span className="text-xs text-slate-400 mt-2 block">1 day left to complete this week</span>
                          </div>

                          <div className="bg-[#FAF9F5] p-4 sm:p-5 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-[#1a2b49]">Weekly Word Target</span>
                              <span className="text-xs font-bold text-[#6eafe9]">840 / 1,000</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                              <div className="h-full bg-[#6eafe9] rounded-full" style={{ width: '84%' }} />
                            </div>
                            <span className="text-xs text-slate-400 mt-2 block">160 words away from weekly target</span>
                          </div>

                          <div className="flex items-center gap-3 p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl text-emerald-800">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium">Milestone achieved: 30 consecutive days with an entry</span>
                          </div>
                        </div>
                      )}

                      {activeSidebarTab === 'Library' && (
                        <div className="space-y-3">
                          {[
                            { title: 'Volume III: Autumn Stillness', period: 'Sep - Nov 2026', count: '24 entries', active: true },
                            { title: 'Volume II: Summer Solstice', period: 'Jun - Aug 2026', count: '56 entries', active: false },
                            { title: 'Volume I: Spring Awakening', period: 'Mar - May 2026', count: '42 entries', active: false },
                          ].map((vol) => (
                            <div
                              key={vol.title}
                              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                                vol.active
                                  ? 'bg-[#eff6fc]/60 border-[#6eafe9]/40 shadow-sm'
                                  : 'bg-[#FAF9F5] border-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Bookmark className={`w-5 h-5 ${vol.active ? 'text-[#6eafe9]' : 'text-slate-400'}`} />
                                <div>
                                  <h4 className="text-sm font-semibold text-[#1a2b49]">{vol.title}</h4>
                                  <span className="text-xs text-slate-400">{vol.period}</span>
                                </div>
                              </div>
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-slate-600 border border-slate-200/60 shadow-xs">
                                {vol.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeSidebarTab === 'Settings' && (
                        <div className="space-y-3">
                          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-slate-100 flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-[#1a2b49]">Color Palette</h4>
                              <p className="text-xs text-slate-400">Warm Cream and Blue Canvas</p>
                            </div>
                            <span className="text-xs font-semibold text-[#6eafe9]">Active</span>
                          </div>
                          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-slate-100 flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-[#1a2b49]">Handwritten Font</h4>
                              <p className="text-xs text-slate-400">Cedarville Cursive for daily quotes</p>
                            </div>
                            <span className="text-xs font-semibold text-[#6eafe9]">Active</span>
                          </div>
                          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-slate-100 flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-[#1a2b49]">Evening Reminder</h4>
                              <p className="text-xs text-slate-400">Daily gentle prompt at 8:30 PM</p>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600">Enabled</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>

            <div
              className={`transition-opacity duration-500 ease-out flex flex-col items-center justify-start z-10 pt-1 pb-2 sm:py-2 lg:-translate-y-8 sm:-translate-y-6 w-full min-w-0 max-w-full overflow-visible order-2 lg:order-none max-lg:flex-shrink-0 max-lg:pt-0 max-lg:pb-0 ${
                activePage === 'Journal'
                  ? activeSidebarTab === 'Book' || isClosingBook
                    ? 'lg:flex-1 flex justify-center'
                    : 'lg:w-[35%] flex-shrink-0 flex justify-center'
                  : 'lg:w-[36%] flex-shrink-0 flex justify-center'
              }`}
            >
              <InteractiveBook
                isOpen={
                  activePage === 'Journal' &&
                  activeSidebarTab === 'Book' &&
                  !isClosingBook &&
                  !isOpeningFromAbout
                }
                textStyle={textStyle}
                onOpen={handleOpenJournal}
                onClose={() => handleNavigatePage('Home')}
              />
            </div>

            <div
              className={`transition-opacity duration-500 ease-out max-lg:contents lg:flex lg:flex-col lg:items-start lg:min-w-0 lg:max-w-full ${
                activePage === 'Journal'
                  ? activeSidebarTab === 'Book' && !isClosingBook
                    ? 'flex w-full lg:w-22 flex-shrink-0 pointer-events-auto lg:-translate-y-7 relative z-20 order-1 lg:order-none mt-2 lg:mt-0'
                    : isClosingBook
                      ? 'w-0 lg:w-22 h-0 max-h-0 opacity-0 pointer-events-none overflow-hidden p-0 m-0 flex-shrink-0'
                      : 'w-0 h-0 max-h-0 opacity-0 pointer-events-none overflow-hidden p-0 m-0'
                  : 'w-full lg:w-[32%] pointer-events-auto lg:pl-6 translate-y-0 order-4 lg:order-none'
              }`}
            >
              <div
                className={`w-full flex flex-col items-start pt-4 sm:pt-20 lg:pt-28 order-4 lg:order-none max-lg:pt-0 ${
                  homeTextState === 'visible' && activePage === 'Home'
                    ? 'opacity-100 translate-x-0 relative pointer-events-auto transition-all duration-500 ease-out'
                    : homeTextState === 'fading-out'
                      ? 'opacity-0 translate-x-6 relative pointer-events-none transition-all duration-300 ease-out'
                      : homeTextState === 'entering'
                        ? 'opacity-0 translate-x-6 relative pointer-events-none transition-none'
                        : 'opacity-0 translate-x-6 absolute top-0 left-0 h-0 max-h-0 overflow-hidden pointer-events-none transition-none'
                }`}
              >
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
                  onClick={handleOpenJournal}
                  className="group inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#6eafe9] hover:bg-[#5b9fe0] text-white font-semibold text-base rounded-2xl shadow-lg shadow-[#6eafe9]/25 hover:shadow-xl hover:shadow-[#6eafe9]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                >
                  <Pencil className="w-5 h-5" />
                  <span>Open Journal</span>
                  <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {activePage === 'Journal' && (
                <div
                  className={`w-full flex justify-center transition-opacity duration-500 ease-out py-1 order-1 lg:order-none ${
                    activeSidebarTab === 'Book' && !isClosingBook
                      ? 'opacity-100 pointer-events-auto'
                      : 'opacity-0 pointer-events-none hidden'
                  }`}
                >
                  <JournalToolbar textStyle={textStyle} onUpdateTextStyle={setTextStyle} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

