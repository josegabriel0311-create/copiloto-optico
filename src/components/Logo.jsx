export function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="#8B5CF6" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="16" cy="16" r="10.5" />
      <circle cx="16" cy="16" r="3.5" />
      <path d="M16 2v4M16 26v4M2 16h4M26 16h4" />
    </svg>
  )
}

export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {!compact && (
        <span className="text-lg font-bold tracking-tight">
          Copiloto <span className="text-brand-500">Óptico</span>
        </span>
      )}
    </div>
  )
}
