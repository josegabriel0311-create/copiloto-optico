# Copiloto Óptico

Micro-SaaS para ópticas: fórmulas, taller, citas, inventario, mermas y reportes.

## Stack

- React 18 + Vite
- Tailwind CSS con tema oscuro/claro (tokens en `src/index.css` y `tailwind.config.js`)
- React Router
- Supabase: login y base de datos. Esquema en `supabase/schema.sql` (pegar en el SQL Editor de Supabase).

## Correr en local

```bash
npm install
npm run dev
```

## Publicar

Conectado a Vercel: cada cambio en `main` se publica solo.

## Pantallas

Inicio · Nueva fórmula · Taller (tablero por estados) · Citas · Inventario · Mermas · Analíticas · Avisos · Suscripción · Ajustes

## Etapas

1. ✅ Design system, layout y pantallas
2. ✅ Login y cuentas por óptica (Supabase)
3. ✅ Datos en Supabase (fórmulas, historial, inventario, mermas, citas)
4. Roles de usuario (recepción, optómetra, taller)
5. Suscripciones y pagos
