inicio contexto

# Proyecto: Pablo Mella Morales - Junta de Vecinos Manzana O-1

## Stack

- Backend: Node.js + Express + Mongoose
- Base de datos: MongoDB Atlas (gratis, Cluster0, us-east-1)
- Almacenamiento de fotos/PDFs: Cloudinary (gratis, 25GB)
- Frontend: React + Vite + TailwindCSS
- Auth: JWT + bcrypt
- Archivos: Multer + multer-storage-cloudinary
- Email: Nodemailer + Gmail SMTP (pendiente configurar)
- Deploy futuro: Railway o Render (backend) + Vercel o Netlify (frontend)

## Contexto del residencial

- Nombre: Residencial Pablo Mella Morales, Manzana O, Parte 1
- 18 edificios, todos de 4 niveles
- Edificios con 4 aptos por nivel: 101-104, 201-204, 301-304, 401-404
- Edificios con 2 aptos por nivel: 101-102, 201-202, 301-302, 401-402
- Aproximadamente 200 apartamentos en total
- Áreas comunes: Gazebo, Salón de eventos, Área de juegos infantil

## Roles

- admin: también es residente con apartamento, pertenece a la directiva
- residente: propietario o inquilino
- La directiva se elige entre los residentes cada cierto tiempo
- Campos de directiva: esDirectiva (boolean), cargoDirectiva (presidente/tesorero/secretario)

## Reglas de negocio importantes

1. Solo el admin puede crear cuentas de residentes
2. Un apartamento solo puede tener un residente activo
3. Si residente debe 2+ meses de cuotas O tiene multas pendientes → no puede reservar
4. Solo un voto por residente por votación
5. Solo una reserva activa por apartamento a la vez
6. El historial de pagos pertenece al apartamento, no al residente
7. Las alertas de emergencia se muestran a todos hasta que admin las desactive
8. El comprobante de pago es obligatorio para reportar un pago
9. Admin aprueba o rechaza cada pago con comprobante
10. Selección en cascada: edificio → apartamento en todos los formularios

## Flujo de pagos

- Residente transfiere al banco (fuera de la app, como siempre)
- Puede seguir enviando foto por WhatsApp (coexistencia)
- También puede subir comprobante en la app
- Admin verifica y aprueba o rechaza con motivo
- Residente descarga recibo digital si es aprobado

## Credenciales iniciales (CAMBIAR EN PRODUCCIÓN)

- Email: admin@pablomella.com
- Password: admin123

## Estructura del proyecto

pablo-mella-app/

├── backend/

│ ├── config/db.js

│ ├── controllers/authController.js

│ ├── middleware/auth.js

│ ├── middleware/upload.js

│ ├── models/

│ │ ├── User.js

│ │ ├── Building.js

│ │ ├── Apartment.js

│ │ ├── Fee.js

│ │ ├── Payment.js

│ │ ├── Expense.js

│ │ ├── Announcement.js

│ │ ├── Maintenance.js

│ │ ├── Fine.js

│ │ ├── Incident.js

│ │ ├── Reservation.js

│ │ ├── Assembly.js

│ │ ├── Vote.js

│ │ └── Document.js

│ ├── routes/authRoutes.js

│ ├── utils/createAdmin.js

│ └── server.js

└── frontend/ (pendiente)

fin contexto

Quedamos en arrancar el Módulo 8 — Frontend React con:

- React + Vite + TailwindCSS
- Panel de Admin y panel de Residente
- Conexión al backend en localhost:5000

📋 Mapa de respuestas del Backend — Pablo Mella
Patrón general
El backend NO usa un wrapper estándar. Cada endpoint devuelve diferente:
TipoEjemplo de respuestaLista directa[ {}, {}, {} ]Objeto directo{ \_id, nombre, token, ... }Con mensaje{ mensaje: "...", dato: {} }Con wrapper data❌ No existe en este backend

AUTH /api/auth
POST /login — respuesta plana, sin wrapper:
json{
"\_id": "...",
"nombre": "Administrador",
"email": "admin@pablomella.com",
"rol": "admin",
"apartamentoId": null,
"esDirectiva": true,
"cargoDirectiva": "presidente",
"telefono": null,
"token": "eyJ..."
}
→ En el frontend: const { token, ...usuario } = data
POST /register — igual que login, respuesta plana con token
GET /perfil — objeto usuario sin password (con populate de apartamento y edificio)
PUT /cambiar-password — { mensaje: "Contraseña actualizada correctamente" }

EDIFICIOS /api/edificios
GET / — array directo:
json[ { _id, numero, nombre, aptasPorPiso, totalPisos, activo } ]
→ En el frontend: const edificios = data (no data.data)
GET /:id — objeto con dos keys:
json{ "edificio": {}, "apartamentos": [] }
→ const { edificio, apartamentos } = data
POST / — { mensaje: "...", edificio: {} }

APARTAMENTOS /api/apartamentos
GET /edificio/:id — array directo:
json[ { _id, numero, piso, residenteActualId: { nombre, email } } ]
→ const apartamentos = data
GET /disponibles — array directo igual
GET /:id — objeto directo con populate
PUT /:id/asignar-residente — { mensaje: "...", apartamento: {} }

CUOTAS /api/cuotas
GET / — array directo:
json[ { _id, tipo, mes, anio, monto, descripcion, fechaLimite } ]
→ const cuotas = data
GET /:id — objeto con tres keys:
json{ "cuota": {}, "pagos": [], "resumen": { totalApartamentos, totalPagados, totalPendientes, totalMorosos } }
GET /resumen/:mes/:anio — objeto:
json{ "mes", "anio", "cuota": {}, "totalRecaudado", "totalApartamentos", "totalPagaron", "totalMorosos", "pagos": [] }
POST / — { mensaje: "...", cuota: {} }

PAGOS /api/pagos
GET /pendientes — array directo con populate:
json[ { _id, cuotaId: {}, apartamentoId: {edificioId:{}}, residenteId: {}, monto, comprobante, estado } ]
→ const pagos = data
GET /mispagos — objeto con dos keys:
json{ "pagos": [], "resumen": { esMoroso, mesesDeuda, multasPendientes } }
→ const { pagos, resumen } = data
GET /moroso/:apartamentoId:
json{ "esMoroso": true, "mesesDeuda": 2, "multasPendientes": 1, "detalle": [], "mensaje": "..." }
GET /apartamento/:id — array directo
POST / — FormData, responde: { mensaje: "...", pago: {} }
PUT /:id/verificar — { mensaje: "...", pago: {} } ⚠️ si rechazado, motivoRechazo es obligatorio

GASTOS /api/gastos
GET / — objeto con dos keys:
json{ "gastos": [], "totalGastos": 1500 }
→ const { gastos, totalGastos } = data
GET /resumen — { "resumen": [{_id: categoria, total, cantidad}], "totalGeneral": 0 }
POST / — FormData (factura opcional), responde: { mensaje: "...", gasto: {} }

ANUNCIOS /api/anuncios
GET / — array directo:
json[ { _id, titulo, contenido, tipo, activo, creadoPor: {nombre} } ]
→ const anuncios = data
GET /emergencias — array directo, solo tipo emergencia y activo: true

MANTENIMIENTO /api/mantenimiento
GET / — array directo con populate

→ const solicitudes = data
GET /mis-solicitudes — array directo
POST / — FormData (foto opcional): { mensaje: "...", solicitud: {} }
PUT /:id — { mensaje: "...", solicitud: {} } — body: { estado, nota }

INCIDENCIAS /api/incidencias
GET / — array directo (anónimas tienen reportadoPor: { nombre: "Anónimo" })
POST / — JSON: { descripcion, anonimo: true/false } → { mensaje: "...", incidencia: {} }

MULTAS /api/multas
GET / — array directo con populate
GET /mis-multas — array directo
POST / — JSON: { apartamentoId, descripcion, monto } → { mensaje: "...", multa: {} }
PUT /:id/pagar — FormData con comprobantePago (obligatorio)
PUT /:id/anular — sin body → { mensaje: "...", multa: {} }

RESERVAS /api/reservas
GET / — array directo con populate
GET /mis-reservas — array directo
GET /calendario — array directo: [{ espacio, fecha, horaInicio, horaFin, estado }]
POST / — JSON: { espacio, fecha, horaInicio, horaFin, descripcion } → { mensaje: "...", reserva: {} } ⚠️ falla si residente es moroso (403)
PUT /:id/verificar — { estado, motivoRechazo } — motivoRechazo obligatorio si rechazada

ASAMBLEAS /api/asambleas
GET / — array directo (sin votaciones):
json[ { \_id, titulo, fecha, hora, lugar, agenda: [] } ]
GET /:id — objeto con dos keys:
json{ "asamblea": {}, "votaciones": [] }
POST / — JSON: { titulo, fecha, hora, lugar, agenda: [] } — todos obligatorios
PUT /:id/acta — FormData con acta

VOTACIONES /api/votaciones
GET /:id/resultados:
json{ "votacion": {}, "totalVotos": 5, "resultados": {"Sí": 3, "No": 2}, "yaVote": true }
POST / — { asambleaId, pregunta, opciones: ["Sí","No"] } → { mensaje: "...", votacion: {} }
POST /:id/votar — { opcion: "Sí" } ⚠️ falla si ya votó
PUT /:id/cerrar — sin body → { mensaje, pregunta, totalVotos, resultados }

DOCUMENTOS /api/documentos
GET / — array directo
POST / — FormData: { titulo, descripcion, tipo, archivo } → { mensaje: "...", documento: {} }

⚠️ Reglas críticas para el frontend

Login: usar const { token, ...usuario } = data — no data.usuario
Listas simples: usar data directamente — no data.data
Edificio/:id, Asamblea/:id: destructurar { edificio, apartamentos } o { asamblea, votaciones }
Pagos/mispagos, Gastos, Resumen: siempre tienen wrapper con dos keys
FormData: pagos, multas pagar, mantenimiento, gastos, documentos, actas
motivoRechazo obligatorio: en verificar pago rechazado y reserva rechazada
