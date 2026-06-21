# Frontend Progress — Pablo Mella Morales

**Última actualización:** Módulo 2 completado
**Developer:** Ramon Diaz (ramndiazg)
**Repo:** https://github.com/ramndiazg/pablo-mella-app

---

## Stack del Frontend

- React + Vite (puerto 3000)
- Tailwind CSS v4 — se importa con `@import "tailwindcss"` (NO las directivas @tailwind)
- axios, react-router-dom, react-hot-toast, @heroicons/react, date-fns
- Proxy configurado: `/api` → `http://localhost:5000`

## Decisiones técnicas importantes

1. **Tailwind v4**: el archivo `index.css` solo contiene `@import "tailwindcss"` — cualquier otra sintaxis rompe los estilos
2. **Login response**: el backend devuelve respuesta PLANA `{ _id, nombre, token, ... }` — en AuthContext se usa `const { token, ...usuario } = data`
3. **Listas del backend**: devuelven array directo, NO `data.data` ni `data.items`
4. **Ver API_REFERENCE.md** para el formato exacto de cada endpoint

---

## Estado actual por módulo

### ✅ Módulo 1 — Fundación (COMPLETO)

- [x] Proyecto creado con Vite + React
- [x] Tailwind v4 configurado (`@import "tailwindcss"` + `@tailwindcss/postcss`)
- [x] `postcss.config.js` con `@tailwindcss/postcss` (no `tailwindcss` directo)
- [x] `vite.config.js` con proxy `/api` → `http://localhost:5000` y puerto 3000
- [x] Dependencias instaladas: axios, react-router-dom, react-hot-toast, @heroicons/react, date-fns

### ✅ Módulo 2 — Autenticación (COMPLETO)

- [x] `src/api/axios.js` — instancia con interceptor JWT y redirect 401
- [x] `src/context/AuthContext.jsx` — estado global, login/logout, esAdmin/esResidente
- [x] `src/main.jsx` — App envuelta en AuthProvider
- [x] `src/pages/Login.jsx` — formulario funcional con toast
- [x] Login probado con admin@pablomella.com ✓ y juan@gmail.com ✓
- [x] Token y usuario guardados en localStorage correctamente

### 🔲 Módulo 3 — Navegación y rutas (COMPLETO)

- [x] `src/components/PrivateRoute.jsx`
- [x] `src/components/Sidebar.jsx`
- [x] `src/components/Layout.jsx`
- [x] `src/App.jsx` con React Router y rutas protegidas por rol
- [x] Redirección post-login: admin → /admin/dashboard, residente → /residente/dashboard
- [x] Cierre de sesión funciona

### ✅ Módulo 4 — Dashboard Admin (COMPLETO)

- [x] `src/components/AlertBanner.jsx` — emergencias en rojo al tope
- [x] `src/pages/admin/Dashboard.jsx` — estadísticas reales del backend
- [x] AlertBanner conectado en Layout.jsx

### ✅ Módulo 5 — Dashboard Residente (COMPLETO)

- [x] `src/pages/resident/Dashboard.jsx` — estado de cuenta, morosidad, anuncios
- [x] AlertBanner funciona en ambos dashboards
- [x] Datos reales del backend: Juan Pérez al día, emergencia de corte de agua visible

### ✅ Módulo 6 — Finanzas Admin (COMPLETO)

- [x] `src/pages/admin/Fees.jsx` — crear y listar cuotas
- [x] `src/pages/admin/Payments.jsx` — verificar comprobantes
- [x] `src/pages/admin/Expenses.jsx` — registrar gastos con FormData
- [x] Rutas conectadas en App.jsx con AdminRoute y ResidenteRoute

### ✅ Módulo 7 — Pagos Residente (COMPLETO)

- [x] `src/components/CascadeSelect.jsx` — selector edificio → apartamento
- [x] `src/pages/resident/ReportPayment.jsx` — subir comprobante con FormData
- [x] Flujo completo probado: pago reportado → admin aprueba → desaparece
- [x] Comprobante sube correctamente a Cloudinary
- [ ] PENDIENTE: toast no visible cuando modal está abierto (Módulo 12)

### ✅ Módulo 8 — Gestión Operativa Admin (COMPLETO)

- [x] `src/pages/admin/Maintenance.jsx`
- [x] `src/pages/admin/Incidents.jsx`
- [x] `src/pages/admin/Fines.jsx`
- [x] `src/pages/admin/Buildings.jsx`
- [x] `src/pages/admin/Residents.jsx`
- [x] Todas las rutas conectadas en App.jsx

### 🔲 Módulo 9 — Operativa Residente (COMPLETO)

- [x] `src/pages/resident/Maintenance.jsx`
- [x] `src/pages/resident/Incidents.jsx`
- [x] `src/pages/resident/Fines.jsx`

### 🔲 Módulo 10 — Reservas (PENDIENTE)

- [ ] `src/pages/admin/Reservations.jsx`
- [ ] `src/pages/resident/Reservations.jsx` — con calendario

### 🔲 Módulo 11 — Asambleas y Documentos (PENDIENTE)

- [ ] `src/pages/admin/Assemblies.jsx`
- [ ] `src/pages/resident/Assemblies.jsx` — con votaciones
- [ ] `src/pages/admin/Documents.jsx`
- [ ] `src/pages/resident/Documents.jsx`

### 🔲 Módulo 12 — Ajustes finales (PENDIENTE)

- [ ] `src/pages/resident/Announcements.jsx`
- [ ] `src/pages/admin/Announcements.jsx`
- [ ] Cambio de contraseña (ambos roles)
- [ ] Silenciar warnings de ESLint
- [ ] Prueba completa de flujos críticos
- [ ] PENDIENTE: agregar aviso ⚠️ en formulario de Fees.jsx "Verifica el monto antes de crear — no se puede editar después"

---

## Estructura de archivos actual

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js ✅
│   ├── context/
│   │   └── AuthContext.jsx ✅
│   ├── components/
│   │   ├── PrivateRoute.jsx ✅
│   │   ├── Sidebar.jsx ✅
│   │   ├── Layout.jsx ✅
│   │   ├── AlertBanner.jsx ✅
│   │   └── CascadeSelect.jsx ✅
│   ├── pages/
│   │   ├── Login.jsx ✅
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx ✅
│   │   │   ├── Fees.jsx ✅
│   │   │   ├── Payments.jsx ✅
│   │   |   ├── Maintenance.jsx ✅
│   │   |   ├── Incidents.jsx ✅
│   │   |   ├── Fines.jsx ✅
│   │   |   └──  Buildings.jsx ✅
│   │   └── Residents.jsx ✅
│   │   │   └── Expenses.jsx ✅
│   │   └── resident/
│   │       ├── Dashboard.jsx ✅
│   │       └── ReportPayment.jsx ✅
│   ├── App.jsx ✅
│   ├── main.jsx ✅
│   └── index.css ✅
├── index.html
├── vite.config.js ✅
├── tailwind.config.js ✅
├── postcss.config.js ✅
└── package.json ✅
```

---

## Archivos de referencia en el proyecto

- `API_REFERENCE.md` — formato exacto de todos los endpoints del backend
- `FRONTEND_PROGRESS.md` — este archivo

---

## Para retomar en una nueva conversación

Pasa estos tres archivos al inicio:

1. Este archivo (`FRONTEND_PROGRESS.md`)
2. `API_REFERENCE.md`
3. El documento de contexto original del proyecto

Luego indica en qué módulo continuar.

---

## Credenciales de prueba

- Admin: admin@pablomella.com / admin123
- Residente: juan@gmail.com / juan123
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

se debe actualizar este archivo para cada commit

## Guía de estilos — para mantener consistencia

### Colores principales

- Azul primario: `bg-blue-600` / `text-blue-600` / `hover:bg-blue-700`
- Fondo de página: `bg-gray-50`
- Tarjetas: `bg-white rounded-xl border border-gray-100 shadow-sm p-4`
- Texto principal: `text-gray-900`
- Texto secundario: `text-gray-500`
- Texto pequeño: `text-gray-400`

### Badges de estado (usar siempre estos)

```jsx
pendiente: "bg-yellow-100 text-yellow-700";
en_proceso: "bg-blue-100 text-blue-700";
resuelto: "bg-green-100 text-green-700";
aprobado: "bg-green-100 text-green-700";
rechazado: "bg-red-100 text-red-700";
pagada: "bg-green-100 text-green-700";
anulada: "bg-gray-100 text-gray-600";
```

### Botones

```jsx
// Primario
"bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors";
// Secundario
"bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors";
// Peligro
"bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors";
// Éxito
"bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors";
```

### Inputs y selects

```jsx
"w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
```

### Labels

```jsx
"block text-sm font-medium text-gray-700 mb-1";
```

### Modales

```jsx
// Overlay
"fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4";
// Contenedor
"bg-white rounded-2xl w-full max-w-md p-6 shadow-xl";
```

### Filtros de estado (tabs)

```jsx
// Activo
"bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium";
// Inactivo
"bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-full text-sm font-medium";
```

### Páginas vacías (empty state)

```jsx
<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
  <p className="text-3xl mb-2">🔧</p>
  <p className="text-sm">Mensaje aquí</p>
</div>
```

### Encabezado de página estándar

```jsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-xl font-bold text-gray-900">Título</h1>
    <p className="text-sm text-gray-500">Subtítulo</p>
  </div>
  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
    + Acción
  </button>
</div>
```

### Patrones importantes

- Espaciado entre secciones: `space-y-4` en el contenedor principal
- Grids: `grid grid-cols-2 gap-3` para formularios de 2 columnas
- Loading spinner: `<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>`
- Siempre usar `toast.success()` y `toast.error()` para feedback
- FormData para: pagos, multas, mantenimiento, gastos, documentos, actas
