import { MessageCircle } from 'lucide-react'
import { linkWhatsApp, numeroWhatsApp } from '../lib/whatsapp.js'
import { cx } from '../lib/utils.js'

const tamaños = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  icon: 'h-9 w-9 justify-center',
}

// Abre WhatsApp con el número del paciente y el mensaje ya escrito
export default function BotonWhatsApp({ telefono, mensaje, onEnviado, size = 'sm', children = 'WhatsApp', className, title }) {
  const sinNumero = !numeroWhatsApp(telefono)
  return (
    <a
      href={linkWhatsApp(telefono, mensaje)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onEnviado?.()}
      title={title ?? (sinNumero ? 'Sin teléfono: WhatsApp te dejará elegir el contacto' : 'Abrir WhatsApp con el mensaje listo')}
      className={cx(
        'inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400',
        tamaños[size],
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {size !== 'icon' && children}
    </a>
  )
}
