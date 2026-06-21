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

### 🔲 Módulo 3 — Navegación y rutas (PENDIENTE)

- [ ] `src/components/Sidebar.jsx`
- [ ] `src/components/Layout.jsx`
- [ ] `src/components/PrivateRoute.jsx`
- [ ] `src/App.jsx` con React Router y rutas protegidas por rol
- [ ] Redirección post-login: admin → /admin/dashboard, residente → /residente/dashboard

### 🔲 Módulo 4 — Dashboard Admin (PENDIENTE)

- [ ] `src/components/AlertBanner.jsx` — emergencias en rojo al tope
- [ ] `src/pages/admin/Dashboard.jsx` — estadísticas del backend

### 🔲 Módulo 5 — Dashboard Residente (PENDIENTE)

- [ ] `src/pages/resident/Dashboard.jsx` — estado de cuenta, morosidad en rojo
- [ ] `src/pages/resident/MyAccount.jsx` — historial de pagos

### 🔲 Módulo 6 — Finanzas Admin (PENDIENTE)

- [ ] `src/pages/admin/Fees.jsx` — crear cuotas
- [ ] `src/pages/admin/Payments.jsx` — verificar comprobantes
- [ ] `src/pages/admin/Expenses.jsx` — registrar gastos

### 🔲 Módulo 7 — Pagos Residente (PENDIENTE)

- [ ] `src/components/CascadeSelect.jsx` — selector edificio → apartamento
- [ ] `src/pages/resident/ReportPayment.jsx` — subir comprobante con FormData

### 🔲 Módulo 8 — Gestión Operativa Admin (PENDIENTE)

- [ ] `src/pages/admin/Maintenance.jsx`
- [ ] `src/pages/admin/Incidents.jsx`
- [ ] `src/pages/admin/Fines.jsx`
- [ ] `src/pages/admin/Buildings.jsx`
- [ ] `src/pages/admin/Residents.jsx`

### 🔲 Módulo 9 — Operativa Residente (PENDIENTE)

- [ ] `src/pages/resident/Maintenance.jsx`
- [ ] `src/pages/resident/Incidents.jsx`
- [ ] `src/pages/resident/Fines.jsx`

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

---

## Estructura de archivos actual

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js ✅
│   ├── context/
│   │   └── AuthContext.jsx ✅
│   ├── pages/
│   │   └── Login.jsx ✅
│   ├── App.jsx ⚠️ temporal, solo muestra Login
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
