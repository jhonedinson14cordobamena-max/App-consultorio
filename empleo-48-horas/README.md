# Empleo48h — Consigue empleo en 48 horas

Sitio web con landing page, bolsa de empleo pública y panel de administración para publicar ofertas directamente, sin depender de terceros.

## Estructura

- `public/index.html` — Landing page principal ("Consigue empleo en 48 horas").
- `public/empleos.html` — Listado público de ofertas, con búsqueda y filtros por ciudad/modalidad.
- `public/admin.html` — Panel protegido por contraseña para publicar, editar y eliminar ofertas.
- `server.js` — API REST (Express) que sirve el sitio y gestiona las ofertas.
- `data/jobs.json` — Almacenamiento de las ofertas (archivo JSON, sin base de datos externa).

## Cómo correrlo localmente

```bash
cd empleo-48-horas
npm install
ADMIN_PASSWORD=tu-clave-segura npm start
```

Abre `http://localhost:3000`.

- Página pública de ofertas: `http://localhost:3000/empleos.html`
- Panel de administración: `http://localhost:3000/admin.html` (usa la contraseña definida en `ADMIN_PASSWORD`)

**Importante:** define siempre `ADMIN_PASSWORD` como variable de entorno antes de publicar el sitio en producción. Si no la defines, se usa una clave por defecto insegura y el servidor te lo advertirá en consola.

## Cómo agregar ofertas

1. Entra a `/admin.html` e inicia sesión con la contraseña de administrador.
2. Llena el formulario (cargo, empresa, ciudad son obligatorios).
3. Define el tipo de contacto: WhatsApp (número con indicativo, ej. `573001234567`) o correo electrónico.
4. Publica. La oferta aparece de inmediato en `/empleos.html`.
5. Puedes editar o eliminar cualquier oferta desde la misma pantalla.

## Despliegue

Es una app Node/Express estándar, compatible con Render, Railway, Fly.io, un VPS, etc. Solo necesitas:

- Ejecutar `npm install && npm start`.
- Definir `PORT` (opcional, por defecto 3000) y `ADMIN_PASSWORD` como variables de entorno.
- Si el hosting usa sistema de archivos efímero (ej. algunos free tiers), considera migrar `data/jobs.json` a una base de datos persistente más adelante.
