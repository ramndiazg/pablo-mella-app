const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Importar todos los modelos
require("./models/User");
require("./models/Building");
require("./models/Apartment");
require("./models/Fee");
require("./models/Payment");
require("./models/Expense");
require("./models/Announcement");
require("./models/Maintenance");
require("./models/Fine");
require("./models/Incident");
require("./models/Reservation");
require("./models/Assembly");
require("./models/Vote");
require("./models/Document");

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/edificios", require("./routes/buildingRoutes"));
app.use("/api/apartamentos", require("./routes/apartmentRoutes"));
app.use("/api/cuotas", require("./routes/feeRoutes"));
app.use("/api/pagos", require("./routes/paymentRoutes"));
app.use("/api/anuncios", require("./routes/announcementRoutes"));
app.use("/api/gastos", require("./routes/expenseRoutes"));
app.use("/api/mantenimiento", require("./routes/maintenanceRoutes"));
app.use("/api/incidencias", require("./routes/incidentRoutes"));
app.use("/api/multas", require("./routes/fineRoutes"));
app.use("/api/reservas", require("./routes/reservationRoutes"));
app.use("/api/asambleas", require("./routes/assemblyRoutes"));
app.use("/api/votaciones", require("./routes/voteRoutes"));
app.use("/api/documentos", require("./routes/documentRoutes"));

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "API Pablo Mella Morales funcionando ✅" });
});

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB Atlas");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error conectando a MongoDB:", error.message);
    process.exit(1);
  });
