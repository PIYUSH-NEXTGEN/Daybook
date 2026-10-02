import sceneImg from '../assets/images/scene.webp'

interface JournalBookProps {
  onClick?: () => void
  className?: string
}

export function JournalBook({ onClick, className = '' }: JournalBookProps) {
  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer select-none ${className}`}
    >
      <div className="absolute -left-7 top-4 bottom-4 w-9 bg-[#2a4d74]/18 rounded-l-full blur-xl pointer-events-none" />
      <div className="absolute -left-3 top-6 bottom-6 w-5 bg-[#1a2f4c]/25 rounded-l-full blur-md pointer-events-none" />
      <div className="absolute -bottom-2.5 left-0 w-24 h-5 bg-[#0f1d2e]/45 rounded-full blur-[4px] pointer-events-none" />
      <div className="absolute -bottom-3 left-6 right-6 h-5 bg-slate-950/35 rounded-full blur-[5px] pointer-events-none" />
      <div className="absolute -bottom-8 left-6 right-2 h-16 bg-[#162a45]/20 rounded-[40px] blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 left-10 right-0 h-24 bg-[#1a3556]/12 rounded-[52px] blur-2xl pointer-events-none" />

      <div
        className="absolute -bottom-9 left-11 sm:left-13 w-6 sm:w-7 h-12 sm:h-13 bg-[#4d92d8] z-2 shadow-md transition-transform duration-300 group-hover:translate-y-1"
        style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)',
        }}
      />

      <div className="absolute left-0 right-[-3px] top-0 bottom-[-3px] rounded-tl-[24px] rounded-bl-[20px] rounded-tr-[24px] rounded-br-[24px] bg-gradient-to-br from-[#68abf0] via-[#4d92dd] to-[#367ec7] border border-[#3b7ebe] shadow-lg z-0" />

      <div className="absolute right-[-2px] sm:right-[-3px] top-3.5 bottom-3.5 w-4 sm:w-5 bg-gradient-to-r from-[#e3ddce] via-[#f9f6ee] to-[#ede7dc] rounded-r-md border-l border-slate-300/70 shadow-[inset_2px_0_4px_rgba(0,0,0,0.12)] z-1 flex flex-col justify-evenly py-2 overflow-hidden">
        <div className="w-full h-px bg-slate-300/60" />
        <div className="w-full h-px bg-slate-300/60" />
        <div className="w-full h-px bg-slate-300/60" />
        <div className="w-full h-px bg-slate-300/60" />
        <div className="w-full h-px bg-slate-300/60" />
      </div>

      <div className="absolute left-5 sm:left-6 right-3.5 bottom-[-2px] h-3.5 sm:h-4 bg-gradient-to-b from-[#e3ddce] via-[#f9f6ee] to-[#ede7dc] rounded-bl-xl rounded-br-md border-t border-slate-300/70 shadow-[inset_4px_2px_4px_rgba(0,0,0,0.15)] z-1 flex items-center justify-evenly px-2 overflow-hidden">
        <div className="h-full w-px bg-slate-300/60" />
        <div className="h-full w-px bg-slate-300/60" />
        <div className="h-full w-px bg-slate-300/60" />
      </div>

      <div className="relative w-[280px] sm:w-[320px] md:w-[350px] h-[380px] sm:h-[435px] md:h-[475px] rounded-tl-[24px] rounded-bl-[20px] rounded-tr-[24px] rounded-br-[24px] shadow-[2px_4px_12px_rgba(15,30,55,0.26),0_20px_40px_-15px_rgba(20,45,80,0.28)] z-10">
        <div
          className="relative w-full h-full rounded-tl-[24px] rounded-bl-[20px] rounded-tr-[24px] rounded-br-[24px] overflow-hidden bg-[#8dc0f8] border border-white/25 shadow-md"
          style={{
            clipPath: 'inset(0 round 24px 24px 24px 20px)'
          }}
        >
          <img
            src={sceneImg}
            alt="DayBook cover scene"
            width={1024}
            height={1536}
            className="w-full h-full object-cover select-none rounded-tl-[24px] rounded-bl-[20px] rounded-tr-[24px] rounded-br-[24px]"
            style={{
              clipPath: 'inset(0 round 24px 24px 24px 20px)'
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none" />

          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-9 bg-gradient-to-r from-slate-950/25 via-white/50 to-slate-950/15 pointer-events-none z-20" />
          <div className="absolute left-0 top-0 bottom-0 w-px bg-white/60 pointer-events-none z-20" />

          <div className="absolute left-2 top-3 w-6 sm:w-7 border-b border-dashed border-white/85 pointer-events-none z-20 rounded-full" />
          <div className="absolute left-2 bottom-3 w-6 sm:w-7 border-t border-dashed border-white/85 pointer-events-none z-20 rounded-full" />

          <div className="absolute left-7 sm:left-8 top-0 bottom-0 w-3 pointer-events-none z-20 flex">
            <div className="w-1 h-full bg-gradient-to-r from-slate-950/35 to-slate-900/10" />
            <div className="w-1 h-full bg-gradient-to-r from-white/40 via-white/85 to-white/30 shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
            <div className="w-1 h-full bg-gradient-to-r from-slate-950/35 to-transparent" />
            <div className="w-px h-full bg-white/75" />
          </div>

          <div className="absolute left-[calc(1.75rem+14px)] sm:left-[calc(2rem+14px)] top-3 bottom-3 border-r border-dashed border-white/90 shadow-[0_0_1px_rgba(0,0,0,0.4)] pointer-events-none z-20" />

          <div className="absolute left-[calc(1.75rem+22px)] sm:left-[calc(2rem+22px)] top-2.5 right-2.5 bottom-2.5 rounded-r-[20px] rounded-l-xs border border-dashed border-white/50 pointer-events-none z-20" />
        </div>

        <div className="absolute -right-6 sm:-right-8 top-1/2 -translate-y-1/2 h-14 sm:h-16 z-40 flex items-center">
          <div className="relative w-8 sm:w-10 h-full rounded-l-md bg-gradient-to-r from-[#7dbcf8] via-[#8ec2f8] to-[#99cdfb] border-2 border-r-0 border-white/70 shadow-[1px_3px_8px_rgba(25,50,85,0.18)] z-20 flex-shrink-0">
            <div className="absolute inset-1 rounded-l-xs border border-r-0 border-dashed border-[#5b9fe0]/80 pointer-events-none" />
          </div>

          <div className="relative w-11 sm:w-13 h-full z-20 perspective-[500px] flex-shrink-0">
            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-300/80 border border-slate-400/60 shadow-inner flex items-center justify-center pointer-events-none z-10">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-500/80 shadow-sm" />
            </div>

            <div className="absolute inset-0 rounded-r-2xl bg-slate-950/0 blur-[6px] transition-all duration-350 ease-out group-hover:bg-slate-950/40 group-hover:translate-x-2.5 group-hover:translate-y-1 group-hover:blur-[8px] pointer-events-none -z-10" />

            <div className="relative w-full h-full rounded-r-2xl bg-gradient-to-r from-[#8ec2f8] to-[#aed7fb] border-2 border-l-0 border-white/70 shadow-[3px_5px_12px_rgba(25,50,85,0.22)] flex items-center justify-center pl-1 sm:pl-1.5 z-20 transition-transform duration-350 ease-out origin-left group-hover:[transform:rotateY(-46deg)] group-hover:shadow-[14px_16px_28px_rgba(15,35,65,0.38)]">
              <div className="absolute inset-0 rounded-r-2xl opacity-0 transition-opacity duration-350 pointer-events-none group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/80 to-black/25" />

              <div className="absolute inset-1 rounded-r-xl border border-l-0 border-dashed border-[#5b9fe0]/80 pointer-events-none" />

              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-[#ffffff] via-[#e5eef7] to-[#ccd9e8] border border-white shadow-[0_2px_4px_rgba(0,0,0,0.14),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center transition-transform duration-350 group-hover:scale-105">
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-b from-[#b8c9dc] to-[#dce7f3] shadow-inner border border-slate-300/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
