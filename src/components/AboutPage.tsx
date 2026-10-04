import hacktoberfestImg from '../assets/images/hacktoberfest.webp'

interface AboutPageProps {
  onStartWriting?: () => void
}

export function AboutPage({ onStartWriting }: AboutPageProps) {
  return (
    <div className="w-full max-w-3xl mx-auto py-4 sm:py-8 md:py-12 animate-in fade-in duration-500 select-none">
      <div className="space-y-10 sm:space-y-14">
        <div>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl text-[#1a2b49] text-center tracking-wide leading-tight mb-6 sm:mb-8"
            style={{ fontFamily: "'Cedarville Cursive', cursive" }}
          >
            About DayBook
          </h1>

          <div className="space-y-5 sm:space-y-6">
            <p className="text-base sm:text-lg text-slate-600 leading-[1.8] font-sans text-left">
              DayBook is your daily sanctuary for mindful reflection, personal growth, and creative journaling. A private, local-first AI companion that learns your habits, identifies recurring patterns, and helps you reflect on your days and routines.
            </p>

            <p className="text-base sm:text-lg text-slate-600 leading-[1.8] font-sans text-left">
              Designed from the ground up to keep your personal thoughts safe, DayBook stores all journal entries on your own device. You can track goals, review wins and struggles, and explore personal insights without sending private reflections to cloud servers or third parties.
            </p>
          </div>
        </div>

        <div>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl text-[#1a2b49] text-center tracking-wide leading-tight mb-6 sm:mb-8"
            style={{ fontFamily: "'Cedarville Cursive', cursive" }}
          >
            What We Built
          </h2>

          <div className="space-y-5 sm:space-y-6">
            <p className="text-base sm:text-lg text-slate-600 leading-[1.8] font-sans text-left">
              DayBook started with a simple problem: a friend of ours was already journaling, but most of the time, the entries just stayed there. They could write about a stressful day, a productive week, a bad habit, or something that kept coming up, but noticing those patterns across dozens of entries was almost impossible manually.
            </p>

            <p className="text-base sm:text-lg text-slate-600 leading-[1.8] font-sans text-left">
              So we built DayBook for them. DayBook is a private AI journal that reads your entries locally and helps surface patterns in your habits, mood, routines, and thoughts over time. Instead of just storing what you write, it helps you understand what keeps showing up.
            </p>
          </div>
        </div>

        <div>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl text-[#1a2b49] text-center tracking-wide leading-tight mb-6 sm:mb-8"
            style={{ fontFamily: "'Cedarville Cursive', cursive" }}
          >
            Privacy by Design
          </h2>

          <div className="space-y-5 sm:space-y-6">
            <p className="text-base sm:text-lg text-slate-600 leading-[1.8] font-sans text-left">
              The important part is where this happens. Your journal never needs to leave your device. DayBook uses a local LLM, so the AI can work with your personal entries without sending them to a cloud AI service.
            </p>

            <p className="text-base sm:text-lg text-slate-600 leading-[1.8] font-sans text-left">
              We wanted to build something that was genuinely useful to one person, while also answering a question we kept coming back to: Can AI be helpful with something as personal as journaling without requiring you to give away your data? DayBook is our attempt at an answer.
            </p>
          </div>
        </div>

        <div>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl text-[#1a2b49] text-center tracking-wide leading-tight mb-6 sm:mb-8"
            style={{ fontFamily: "'Cedarville Cursive', cursive" }}
          >
            Open Source &amp; Hacktoberfest
          </h2>

          <div className="my-6 sm:my-8 overflow-hidden rounded-2xl border border-slate-200/80 shadow-md">
            <img
              src={hacktoberfestImg}
              alt="Hacktoberfest"
              className="w-full h-auto object-cover select-none"
              loading="lazy"
            />
          </div>

          <div className="space-y-5 sm:space-y-6">
            <p className="text-base sm:text-lg text-slate-600 leading-[1.8] font-sans text-left">
              Crafted as an open-source project for Hacktoberfest, DayBook runs entirely on your own machine powered by the Gemma 3:4B model through Ollama. No remote servers, no third-party tracking, and no subscriptions.
            </p>

            <p className="text-base sm:text-lg text-slate-600 leading-[1.8] font-sans text-left">
              Just an honest, local-first companion designed to help you reflect, discover meaningful patterns, and keep your journal truly yours.
            </p>
          </div>
        </div>

        <div className="text-center pt-8 sm:pt-12 border-t border-slate-200/50 space-y-3">
          <p
            className="text-3xl sm:text-4xl text-[#4f8ee6]"
            style={{ fontFamily: "'Cedarville Cursive', cursive" }}
          >
            Private, local, and built for you.
          </p>

          <p
            className="text-2xl sm:text-3xl text-slate-500"
            style={{ fontFamily: "'Cedarville Cursive', cursive" }}
          >
            Happy Journaling
          </p>

          {onStartWriting && (
            <div className="pt-4">
              <button
                type="button"
                onClick={onStartWriting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#6eafe9] hover:bg-[#5b9fe0] text-white font-semibold text-sm shadow-md shadow-[#6eafe9]/20 hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Write Today&apos;s Entry</span>
                <span>&rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
