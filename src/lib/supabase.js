import { createClient } from '@supabase/supabase-js'

// La URL y la clave "publishable" son públicas por diseño: la seguridad de los datos
// está en las reglas de la base de datos (ver supabase/schema.sql).
// Se pueden reemplazar con variables de entorno en Vercel.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://ljrtdwplxbkalmfoxdrj.supabase.co'
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_DZS87dLA3tNiCRwtEzP6pw_tglMbMBE'

export const supabase = createClient(url, key)
