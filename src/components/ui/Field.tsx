import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Search } from 'lucide-react'

interface FieldProps {
  etiqueta: string
  htmlFor?: string
  ayuda?: string
  error?: string
  requerido?: boolean
  children: ReactNode
  className?: string
}

export function Field({
  etiqueta,
  htmlFor,
  ayuda,
  error,
  requerido,
  children,
  className = '',
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="label-tech flex items-center gap-1 text-ink-3"
      >
        {etiqueta}
        {requerido ? (
          <span aria-hidden className="text-oxblood">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-oxblood" role="alert">
          {error}
        </p>
      ) : ayuda ? (
        <p className="text-[11px] text-ink-4">{ayuda}</p>
      ) : null}
    </div>
  )
}

const base =
  'w-full rounded-xs border bg-paper px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink-4 transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-ink-4'

export function Input({
  error,
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={`${base} ${error ? 'border-oxblood' : 'border-rule-2 focus:border-ink-3'} ${className}`}
      {...rest}
    />
  )
}

export function Textarea({
  error,
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={`${base} min-h-20 resize-y leading-relaxed ${error ? 'border-oxblood' : 'border-rule-2 focus:border-ink-3'} ${className}`}
      {...rest}
    />
  )
}

export function Select({
  error,
  className = '',
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      className={`${base} cursor-pointer appearance-none bg-[length:14px] bg-[right_0.6rem_center] bg-no-repeat pr-8 ${error ? 'border-oxblood' : 'border-rule-2 focus:border-ink-3'} ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e6459' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...rest}
    >
      {children}
    </select>
  )
}

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
}

export function SearchInput({ etiqueta, className = '', ...rest }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-4"
      />
      <input
        type="search"
        aria-label={etiqueta}
        placeholder={etiqueta}
        className={`${base} border-rule-2 pl-8 focus:border-ink-3`}
        {...rest}
      />
    </div>
  )
}
