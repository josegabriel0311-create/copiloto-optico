import { Input, Textarea } from './ui/index.jsx'

export const pacienteVacio = { nombre: '', documento: '', telefono: '', email: '', fecha_nacimiento: '', notas: '' }

// Campos del paciente. `valor` y `onChange` manejan el objeto completo.
export default function FormPaciente({ valor, onChange, conNotas = true, autoFocus = false }) {
  const set = (k) => (e) => onChange({ ...valor, [k]: e.target.value })
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Nombre completo" placeholder="Ej.: María Fernanda Rojas" value={valor.nombre} onChange={set('nombre')} required autoFocus={autoFocus} />
      <Input label="Documento" placeholder="C.C. 1.020.304.050" value={valor.documento ?? ''} onChange={set('documento')} />
      <Input label="Teléfono" placeholder="300 123 4567" value={valor.telefono ?? ''} onChange={set('telefono')} hint="Para avisarle cuando sus gafas estén listas" />
      <Input label="Fecha de nacimiento" type="date" value={valor.fecha_nacimiento ?? ''} onChange={set('fecha_nacimiento')} />
      <Input className="sm:col-span-2" label="Correo" type="email" placeholder="paciente@correo.com" value={valor.email ?? ''} onChange={set('email')} />
      {conNotas && (
        <Textarea
          className="sm:col-span-2"
          label="Antecedentes y notas"
          placeholder="Uso de lentes de contacto, cirugías, alergias, ocupación…"
          value={valor.notas ?? ''}
          onChange={set('notas')}
        />
      )}
    </div>
  )
}

export function edad(fecha) {
  if (!fecha) return null
  const n = new Date(`${fecha}T12:00:00`)
  const hoy = new Date()
  let e = hoy.getFullYear() - n.getFullYear()
  if (hoy.getMonth() < n.getMonth() || (hoy.getMonth() === n.getMonth() && hoy.getDate() < n.getDate())) e--
  return e >= 0 ? e : null
}

export const normalizar = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
