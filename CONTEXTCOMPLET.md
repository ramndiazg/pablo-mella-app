# CONTEXTO COMPLETO - Pablo Mella App

# Continuación: Módulo Frontend React

## PROYECTO

Sistema de gestión para Junta de Vecinos
Residencial Pablo Mella Morales — Manzana O, Parte 1
GitHub: https://github.com/ramndiazg/pablo-mella-app
Developer: Ramon Diaz (ramndiazg) — Santo Domingo, RD

## STACK COMPLETO

- Backend: Node.js + Express (COMPLETO Y FUNCIONANDO)
- Base de datos: MongoDB Atlas (gratis, Cluster0, us-east-1)
- Almacenamiento fotos/PDFs: Cloudinary (gratis, 25GB)
- Frontend: React + Vite + TailwindCSS (PENDIENTE — siguiente paso)
- Auth: JWT + bcrypt
- Archivos: Multer + multer-storage-cloudinary
- Deploy futuro: Railway o Render (backend) + Vercel o Netlify (frontend)

## ESTRUCTURA DEL PROYECTO

pablo-mella-app/

├── backend/ ← COMPLETO Y FUNCIONANDO en puerto 5000

│ ├── config/db.js

│ ├── controllers/

│ │ ├── authController.js

│ │ ├── buildingController.js

│ │ ├── apartmentController.js

│ │ ├── feeController.js

│ │ ├── paymentController.js

│ │ ├── expenseController.js

│ │ ├── announcementController.js

│ │ ├── maintenanceController.js

│ │ ├── incidentController.js

│ │ ├── fineController.js

│ │ ├── reservationController.js

│ │ ├── assemblyController.js

│ │ ├── voteController.js

│ │ └── documentController.js

│ ├── middleware/

│ │ ├── auth.js ← protect, adminOnly

│ │ └── upload.js ← Cloudinary + Multer

│ ├── models/

│ │ ├── User.js

│ │ ├── Building.js

│ │ ├── Apartment.js

│ │ ├── Fee.js

│ │ ├── Payment.js

│ │ ├── Expense.js

│ │ ├── Announcement.js

│ │ ├── Maintenance.js

│ │ ├── Incident.js

│ │ ├── Fine.js

│ │ ├── Reservation.js

│ │ ├── Assembly.js

│ │ ├── Vote.js

│ │ └── Document.js

│ ├── routes/

│ │ ├── authRoutes.js

│ │ ├── buildingRoutes.js

│ │ ├── apartmentRoutes.js

│ │ ├── feeRoutes.js

│ │ ├── paymentRoutes.js

│ │ ├── expenseRoutes.js

│ │ ├── announcementRoutes.js

│ │ ├── maintenanceRoutes.js

│ │ ├── incidentRoutes.js

│ │ ├── fineRoutes.js

│ │ ├── reservationRoutes.js

│ │ ├── assemblyRoutes.js

│ │ ├── voteRoutes.js

│ │ └── documentRoutes.js

│ ├── utils/createAdmin.js

│ └── server.js

└── frontend/ ← CREAR AQUÍ con React + Vite + TailwindCSS

## CREDENCIALES DE PRUEBA

- Admin: admin@pablomella.com / admin123
- Residente prueba: juan@gmail.com / juan123
- Backend corre en: http://localhost:5000

## CONTEXTO DEL RESIDENCIAL

- 18 edificios, todos de 4 niveles
- Edificios con 4 aptos por nivel: 101-104, 201-204, 301-304, 401-404
- Edificios con 2 aptos por nivel: 101-102, 201-202, 301-302, 401-402
- Aproximadamente 200 apartamentos en total
- Áreas comunes: Gazebo, Salón de eventos, Área de juegos infantil

## ROLES DEL SISTEMA

- admin: también es residente con apartamento, pertenece a la directiva
- residente: propietario o inquilino
- La directiva se elige entre los residentes (campos: esDirectiva, cargoDirectiva)

## REGLAS DE NEGOCIO

1. Solo admin puede crear cuentas de residentes
2. Un apartamento solo puede tener un residente activo
3. Si residente debe 2+ meses O tiene multas pendientes → no puede reservar
4. Solo un voto por residente por votación
5. Solo una reserva activa por apartamento a la vez
6. El historial de pagos pertenece al apartamento, no al residente
7. Alertas de emergencia visibles hasta que admin las desactive
8. Comprobante de pago obligatorio para reportar un pago
9. Admin aprueba o rechaza cada pago
10. Selección en cascada edificio → apartamento en formularios

## TODAS LAS RUTAS DEL BACKEND

### AUTH — /api/auth

POST /api/auth/login ← público, body: {email, password}
POST /api/auth/register ← solo admin, body: {nombre, email, password, rol, apartamentoId, telefono, esDirectiva, cargoDirectiva}
GET /api/auth/perfil ← usuario autenticado
PUT /api/auth/cambiar-password ← usuario autenticado, body: {passwordActual, passwordNuevo}

### EDIFICIOS — /api/edificios

GET /api/edificios ← lista todos los edificios activos
GET /api/edificios/:id ← edificio con sus apartamentos
POST /api/edificios ← solo admin, body: {numero, nombre, aptasPorPiso}
PUT /api/edificios/:id ← solo admin, body: cualquier campo

### APARTAMENTOS — /api/apartamentos

GET /api/apartamentos/disponibles ← solo admin, apartamentos sin residente
GET /api/apartamentos/edificio/:edificioId ← apartamentos de un edificio
GET /api/apartamentos/:id ← detalle de un apartamento
PUT /api/apartamentos/:id/asignar-residente ← solo admin, body: {residenteId}
PUT /api/apartamentos/:id/desvincular-residente ← solo admin

### CUOTAS — /api/cuotas

GET /api/cuotas ← todas las cuotas
GET /api/cuotas/:id ← cuota con pagos y resumen
GET /api/cuotas/resumen/:mes/:anio ← solo admin, resumen financiero del mes
POST /api/cuotas ← solo admin, body: {tipo, mes, anio, monto, descripcion, fechaLimite}
tipo: 'mensual' | 'extraordinaria'

### PAGOS — /api/pagos

GET /api/pagos/mispagos ← residente, sus pagos con estado morosidad
GET /api/pagos/pendientes ← solo admin, pagos por verificar
GET /api/pagos/moroso/:apartamentoId ← verifica morosidad de un apartamento
GET /api/pagos/apartamento/:apartamentoId ← historial de pagos de un apartamento
POST /api/pagos ← residente, form-data: {cuotaId, apartamentoId, monto, comprobante(File)}
PUT /api/pagos/:id/verificar ← solo admin, body: {estado, motivoRechazo}
estado: 'aprobado' | 'rechazado'

### GASTOS — /api/gastos

GET /api/gastos ← todos los gastos, query: ?mes=6&anio=2026
GET /api/gastos/resumen ← solo admin, resumen por categoría, query: ?mes=6&anio=2026
POST /api/gastos ← solo admin, form-data: {descripcion, monto, categoria, fecha, factura(File opcional)}
categorias: 'electricidad' | 'plomeria' | 'limpieza' | 'materiales' | 'jardineria' | 'seguridad' | 'otro'
DELETE /api/gastos/:id ← solo admin

### ANUNCIOS — /api/anuncios

GET /api/anuncios ← todos los anuncios activos
GET /api/anuncios/emergencias ← solo emergencias activas
POST /api/anuncios ← solo admin, body: {titulo, contenido, tipo}
tipo: 'normal' | 'emergencia'
PUT /api/anuncios/:id/desactivar ← solo admin
DELETE /api/anuncios/:id ← solo admin

### MANTENIMIENTO — /api/mantenimiento

GET /api/mantenimiento ← solo admin, todas las solicitudes, query: ?estado=pendiente
GET /api/mantenimiento/mis-solicitudes ← residente, sus solicitudes
POST /api/mantenimiento ← residente, form-data: {descripcion, tipo, foto(File opcional)}
tipos: 'electrico' | 'plomeria' | 'limpieza' | 'estructura' | 'otro'
PUT /api/mantenimiento/:id ← solo admin, body: {estado, nota}
estados: 'pendiente' | 'en_proceso' | 'resuelto'

### INCIDENCIAS — /api/incidencias

GET /api/incidencias ← solo admin, todas, query: ?estado=pendiente
POST /api/incidencias ← residente, body: {descripcion, anonimo}
PUT /api/incidencias/:id ← solo admin, body: {estado}
estados: 'pendiente' | 'en_proceso' | 'resuelto'

### MULTAS — /api/multas

GET /api/multas ← solo admin, todas, query: ?estado=pendiente
GET /api/multas/mis-multas ← residente, sus multas
POST /api/multas ← solo admin, body: {apartamentoId, descripcion, monto}
PUT /api/multas/:id/pagar ← residente, form-data: {comprobantePago(File)}
PUT /api/multas/:id/anular ← solo admin

### RESERVAS — /api/reservas

GET /api/reservas ← solo admin, todas, query: ?estado=pendiente&espacio=salon
GET /api/reservas/mis-reservas ← residente, sus reservas
GET /api/reservas/calendario ← todos, query: ?mes=6&anio=2026
POST /api/reservas ← residente, body: {espacio, fecha, horaInicio, horaFin, descripcion}
espacios: 'gazebo' | 'salon'
PUT /api/reservas/:id/verificar ← solo admin, body: {estado, motivoRechazo}
estados: 'aprobada' | 'rechazada'
PUT /api/reservas/:id/cancelar ← residente
PUT /api/reservas/:id/incidente ← solo admin, body: {incidente}

### ASAMBLEAS — /api/asambleas

GET /api/asambleas ← todas las asambleas
GET /api/asambleas/:id ← asamblea con sus votaciones
POST /api/asambleas ← solo admin, body: {titulo, fecha, hora, lugar, agenda}
PUT /api/asambleas/:id/acta ← solo admin, form-data: {acta(File)}

### VOTACIONES — /api/votaciones

GET /api/votaciones/:id/resultados ← todos, resultados de una votación
POST /api/votaciones ← solo admin, body: {asambleaId, pregunta, opciones}
POST /api/votaciones/:id/votar ← residente, body: {opcion}
PUT /api/votaciones/:id/cerrar ← solo admin

### DOCUMENTOS — /api/documentos

GET /api/documentos ← todos, query: ?tipo=reglamento
POST /api/documentos ← solo admin, form-data: {titulo, descripcion, tipo, archivo(File)}
tipos: 'reglamento' | 'acta' | 'circular' | 'otro'
DELETE /api/documentos/:id ← solo admin

## AUTENTICACIÓN EN FRONTEND

- JWT se guarda en localStorage como 'token'
- Cada request lleva header: Authorization: Bearer TOKEN
- Al login se guarda también el objeto usuario completo
- Si el token expira (401) → redirigir al login

## ESTRUCTURA FRONTEND A CREAR

frontend/

├── src/

│ ├── main.jsx

│ ├── App.jsx

│ ├── api/

│ │ └── axios.js ← instancia base con JWT automático

│ ├── context/

│ │ └── AuthContext.jsx ← estado global usuario logueado

│ ├── components/

│ │ ├── Navbar.jsx

│ │ ├── Sidebar.jsx

│ │ ├── PrivateRoute.jsx

│ │ ├── AlertBanner.jsx ← muestra emergencias en rojo

│ │ └── CascadeSelect.jsx ← selector edificio → apartamento

│ └── pages/

│ ├── Login.jsx

│ ├── admin/

│ │ ├── Dashboard.jsx ← resumen general

│ │ ├── Residents.jsx ← crear y gestionar residentes

│ │ ├── Buildings.jsx ← crear edificios

│ │ ├── Fees.jsx ← crear cuotas

│ │ ├── Payments.jsx ← verificar comprobantes

│ │ ├── Expenses.jsx ← registrar gastos

│ │ ├── Announcements.jsx ← anuncios y alertas

│ │ ├── Maintenance.jsx ← solicitudes de mantenimiento

│ │ ├── Incidents.jsx ← incidencias entre vecinos

│ │ ├── Fines.jsx ← multas

│ │ ├── Reservations.jsx ← aprobar reservas

│ │ ├── Assemblies.jsx ← asambleas y votaciones

│ │ └── Documents.jsx ← documentos

│ └── resident/

│ ├── Dashboard.jsx ← estado cuenta + alertas

│ ├── MyAccount.jsx ← mis pagos + morosidad

│ ├── ReportPayment.jsx ← subir comprobante

│ ├── Maintenance.jsx ← mis solicitudes

│ ├── Incidents.jsx ← reportar incidencia

│ ├── Fines.jsx ← mis multas

│ ├── Reservations.jsx ← hacer reservas + calendario

│ ├── Announcements.jsx ← anuncios

│ ├── Assemblies.jsx ← asambleas y votar

│ └── Documents.jsx ← documentos

├── index.html

├── vite.config.js

├── tailwind.config.js

└── package.json

## DEPENDENCIAS FRONTEND A INSTALAR

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-hot-toast
npm install @heroicons/react
npm install date-fns
```

## NOTAS IMPORTANTES PARA EL FRONTEND

1. El selector edificio→apartamento debe ser en cascada en todos los formularios
2. Las alertas de emergencia deben aparecer en ROJO al tope de todas las páginas
3. El dashboard del admin debe mostrar: pagos pendientes, solicitudes pendientes, reservas pendientes
4. El dashboard del residente debe mostrar: estado de cuenta, si es moroso en rojo, próximos anuncios
5. Al subir archivos usar FormData, no JSON
6. React Router para navegación, rutas protegidas por rol
7. AuthContext guarda: token, usuario (con rol, apartamentoId, nombre)
8. Redirigir según rol después del login: admin→/admin/dashboard, residente→/residente/dashboard

## MÓDULOS COMPLETADOS EN BACKEND

- [x] Módulo 1: Base + Auth
- [x] Módulo 2: Edificios y Apartamentos
- [x] Módulo 3: Finanzas y Pagos
- [x] Módulo 4: Anuncios, Alertas y Gastos
- [x] Módulo 5: Mantenimiento, Incidencias y Multas
- [x] Módulo 6: Reservas Gazebo y Salón
- [x] Módulo 7: Asambleas, Votaciones y Documentos
- [ ] Módulo 8: Frontend React (SIGUIENTE PASO)
