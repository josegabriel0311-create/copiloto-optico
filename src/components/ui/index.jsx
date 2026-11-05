// Componentes base del design system de Copiloto Óptico
import { Search } from 'lucide-react'
import { cx } from '../../lib/utils.js'

const buttonVariants = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600',
  outline: 'border border-line bg-surface text-ink hover:bg-surface2',
  ghost: 'text-muted hover:bg-surface2 hover:text-ink',
  subtle: 'border border-line bg-surface2/60 text-ink hover:bg-surface2',
}
const buttonSizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-sm',
}

export function Button({ variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, className, children, ...props }) {
  return (
    <button
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:cursor-not-allowed disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
      {IconRight && <IconRight className="h-4 w-4" />}
    </button>
  )
}

export function IconButton({ icon: Icon, label, className, ...props }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface2/60 text-ink transition-colors hover:bg-surface2',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

export function Card({ className, children, ...props }) {
  return (
    <div className={cx('rounded-2xl border border-line bg-surface p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  )
}

const tones = {
  blue: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400',
  violet: 'border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-300',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  red: 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400',
  neutral: 'border-line bg-surface2 text-muted',
}

export function Badge({ tone = 'neutral', className, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const iconTones = {
  violet: 'bg-brand-500/15 text-brand-500 dark:text-brand-400',
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
}

export function StatCard({ label, value, icon: Icon, tone = 'violet', children }) {
  return (
    <Card className="flex items-center gap-4">
      {Icon && (
        <div className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconTones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-0.5 text-2xl font-bold">{value}</p>
        {children}
      </div>
    </Card>
  )
}

const fieldBase =
  'w-full rounded-xl border border-line bg-surface2/40 px-3.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'

export function Field({ label, hint, children, className }) {
  return (
    <label className={cx('block', className)}>
      {label && <span className="mb-1.5 block text-sm font-semibold">{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export function Input({ label, hint, className, ...props }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input className={cx(fieldBase, 'h-11')} {...props} />
    </Field>
  )
}

export function Select({ label, hint, className, children, ...props }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <select className={cx(fieldBase, 'h-11 pr-8')} {...props}>
        {children}
      </select>
    </Field>
  )
}

export function Textarea({ label, hint, className, ...props }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <textarea className={cx(fieldBase, 'min-h-[88px] py-2.5')} {...props} />
    </Field>
  )
}

export function SearchInput({ className, ...props }) {
  return (
    <div className={cx('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input className={cx(fieldBase, 'h-11 pl-10')} {...props} />
    </div>
  )
}

export function PageHeader({ title, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      {title ? <h1 className="text-xl font-bold">{title}</h1> : <span />}
      {actions && <div className="flex flex-wrap items-end gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      {Icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-500">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <p className="font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
