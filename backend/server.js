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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/edificios", require("./routes/buildingRoutes"));
app.use("/api/apartamentos", require("./routes/apartmentRoutes"));
app.use("/api/cuotas", require("./routes/feeRoutes"));
app.use("/api/pagos", require("./routes/paymentRoutes"));

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "API Pablo Mella Morales funcionando ✅" });
});

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB Atlas");
    app.listen(process.env.PORT, () => {
      console.log(`✅ Servidor corriendo en puerto ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error conectando a MongoDB:", error.message);
    process.exit(1);
  });
