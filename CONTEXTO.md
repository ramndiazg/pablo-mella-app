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
