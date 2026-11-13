import { pesos } from './utils.js'

// Convierte un teléfono escrito a mano al formato que entiende WhatsApp (solo dígitos, con indicativo)
export function numeroWhatsApp(telefono = '') {
  let d = String(telefono).replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('00')) d = d.slice(2)
  // Celular colombiano sin indicativo: 10 dígitos que empiezan por 3
  if (d.length === 10 && d.startsWith('3')) return `57${d}`
  return d
}

// Sin número válido, WhatsApp deja elegir el contacto
export function linkWhatsApp(telefono, texto = '') {
  const n = numeroWhatsApp(telefono)
  const q = texto ? `?text=${encodeURIComponent(texto)}` : ''
  return `https://wa.me/${n}${q}`
}

const primerNombre = (nombre = '') => nombre.trim().split(/\s+/)[0] || ''

const fechaCita = (f) => new Date(`${f}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

export const PLANTILLA_LISTA = 'Hola {nombre}, te saludamos de {optica}. ¡Tus gafas ya están listas para recoger! Te esperamos.'

export const VARIABLES = [
  ['{nombre}', 'Primer nombre del paciente'],
  ['{optica}', 'Nombre de tu óptica'],
  ['{saldo}', 'Saldo pendiente. Si no lo usas y hay saldo, se agrega al final.'],
]

function llenar(plantilla, valores) {
  return plantilla.replace(/\{(\w+)\}/g, (m, k) => (k in valores ? valores[k] : m))
}

export function mensajeLista({ paciente, optica, saldo = 0, plantilla }) {
  const base = (plantilla ?? optica?.mensaje_lista ?? '').trim() || PLANTILLA_LISTA
  let texto = llenar(base, {
    nombre: primerNombre(paciente),
    optica: optica?.nombre || 'tu óptica',
    saldo: pesos(saldo),
  })
  if (saldo > 0 && !base.includes('{saldo}')) texto += ` Saldo pendiente: ${pesos(saldo)}.`
  return texto
}

export function mensajeCita({ cita, optica }) {
  return `Hola ${primerNombre(cita.paciente)}, te saludamos de ${optica?.nombre || 'tu óptica'}. Te recordamos tu cita de ${(
    cita.motivo || 'control'
  ).toLowerCase()} el ${fechaCita(cita.fecha)} a las ${cita.hora}. ¡Te esperamos!`
}

export function mensajeSaldo({ paciente, optica, saldo }) {
  return `Hola ${primerNombre(paciente)}, te saludamos de ${optica?.nombre || 'tu óptica'}. Te recordamos que tienes un saldo pendiente de ${pesos(
    saldo,
  )} por tus gafas. ¡Gracias!`
}

export function mensajeSaludo({ paciente, optica }) {
  return `Hola ${primerNombre(paciente)}, te saludamos de ${optica?.nombre || 'tu óptica'}.`
}
