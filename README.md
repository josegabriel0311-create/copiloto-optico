# Copiloto Óptico

Micro-SaaS para ópticas: fórmulas, taller, citas, inventario, mermas y reportes.

## Stack

- React 18 + Vite
- Tailwind CSS con tema oscuro/claro (tokens en `src/index.css` y `tailwind.config.js`)
- React Router
- Datos: por ahora en el navegador (`src/lib/store.jsx`, con datos de ejemplo). Próximamente Supabase.

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

1. ✅ Design system, layout y pantallas (datos de ejemplo en el navegador)
2. Login y cuentas por óptica (Supabase)
3. Pasar los datos a Supabase (fórmulas, inventario, mermas, citas)
4. Roles de usuario (recepción, optómetra, taller)
5. Suscripciones y pagos
