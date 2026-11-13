export const ROLES = {
  admin: 'Administrador',
  recepcion: 'Recepción',
  optometra: 'Optómetra',
  taller: 'Taller',
}

export const DESCRIPCION_ROL = {
  admin: 'Acceso total, incluido el equipo, los ajustes y los reportes.',
  recepcion: 'Fórmulas, pacientes, citas, cobros, taller e inventario.',
  optometra: 'Fórmulas, pacientes, citas y taller.',
  taller: 'Tablero del taller, inventario y mermas.',
}

const TODOS = ['admin', 'recepcion', 'optometra', 'taller']

// Qué secciones ve cada rol
const ACCESO = {
  '/': TODOS,
  '/nueva-formula': ['admin', 'recepcion', 'optometra'],
  '/pacientes': ['admin', 'recepcion', 'optometra'],
  '/taller': TODOS,
  '/citas': ['admin', 'recepcion', 'optometra'],
  '/cobros': ['admin', 'recepcion'],
  '/inventario': ['admin', 'recepcion', 'taller'],
  '/mermas': ['admin', 'recepcion', 'taller'],
  '/analiticas': ['admin'],
  '/avisos': TODOS,
  '/suscripcion': ['admin'],
  '/ajustes': TODOS,
}

export function puede(rol, ruta) {
  const r = rol in ROLES ? rol : 'admin'
  const clave = Object.keys(ACCESO)
    .filter((k) => (k === '/' ? ruta === '/' : ruta === k || ruta.startsWith(`${k}/`)))
    .sort((a, b) => b.length - a.length)[0]
  return clave ? ACCESO[clave].includes(r) : true
}

export const puedeCobrar = (rol) => puede(rol, '/cobros')
export const esAdmin = (rol) => !rol || rol === 'admin'
