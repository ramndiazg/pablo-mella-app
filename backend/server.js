const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", require("./routes/authRoutes"));

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
