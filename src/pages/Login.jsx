import { useState } from 'react'
import { LogIn, UserPlus, MailCheck } from 'lucide-react'
import { Button, Card, Input } from '../components/ui/index.jsx'
import { LogoMark } from '../components/Logo.jsx'
import { supabase } from '../lib/supabase.js'

const traducir = (msg = '') => {
  if (/invalid login credentials/i.test(msg)) return 'Correo o contraseña incorrectos.'
  if (/email not confirmed/i.test(msg)) return 'Aún no has confirmado tu correo. Revisa tu bandeja de entrada.'
  if (/already registered/i.test(msg)) return 'Ese correo ya tiene una cuenta. Inicia sesión.'
  if (/password should be at least/i.test(msg)) return 'La contraseña debe tener al menos 6 caracteres.'
  if (/rate limit/i.test(msg)) return 'Demasiados intentos. Espera un momento y vuelve a intentar.'
  return msg || 'Algo salió mal. Intenta de nuevo.'
}

export function Pantalla({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="h-12 w-12" />
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            Copiloto <span className="text-brand-500">Óptico</span>
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Login() {
  const [modo, setModo] = useState('entrar') // entrar | registro | revisar-correo
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    if (modo === 'entrar') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password: clave })
      if (err) setError(traducir(err.message))
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password: clave,
        options: { emailRedirectTo: window.location.origin },
      })
      if (err) setError(traducir(err.message))
      else if (!data.session) setModo('revisar-correo')
    }
    setEnviando(false)
  }

  if (modo === 'revisar-correo') {
    return (
      <Pantalla>
        <Card className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-500">
            <MailCheck className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold">Revisa tu correo</h2>
          <p className="mt-2 text-sm text-muted">
            Te enviamos un enlace a <span className="font-semibold text-ink">{email}</span> para confirmar tu cuenta. Ábrelo y volverás aquí con la sesión iniciada.
          </p>
          <Button variant="ghost" className="mt-5" onClick={() => setModo('entrar')}>
            Volver a iniciar sesión
          </Button>
        </Card>
      </Pantalla>
    )
  }

  const registro = modo === 'registro'

  return (
    <Pantalla>
      <Card>
        <h2 className="text-lg font-bold">{registro ? 'Crea tu cuenta' : 'Inicia sesión'}</h2>
        <p className="mt-1 text-sm text-muted">
          {registro ? 'Empieza a gestionar tu óptica en minutos.' : 'Entra para ver el resumen de tu óptica.'}
        </p>
        <form onSubmit={enviar} className="mt-6 space-y-4">
          <Input label="Correo" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label="Contraseña"
            type="password"
            autoComplete={registro ? 'new-password' : 'current-password'}
            minLength={6}
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            hint={registro ? 'Mínimo 6 caracteres' : undefined}
            required
          />
          {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
          <Button type="submit" size="lg" className="w-full" icon={registro ? UserPlus : LogIn} disabled={enviando}>
            {enviando ? 'Un momento…' : registro ? 'Crear cuenta' : 'Entrar'}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          {registro ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
          <button
            onClick={() => {
              setError('')
              setModo(registro ? 'entrar' : 'registro')
            }}
            className="font-semibold text-brand-500 hover:underline"
          >
            {registro ? 'Inicia sesión' : 'Créala gratis'}
          </button>
        </p>
      </Card>
    </Pantalla>
  )
}
