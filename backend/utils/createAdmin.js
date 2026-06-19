const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB Atlas");

    // Verificar si ya existe un admin
    const adminExiste = await User.findOne({ email: "admin@pablomella.com" });
    if (adminExiste) {
      console.log("⚠️  El admin ya existe");
      process.exit(0);
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("admin123", salt);

    // Crear admin
    const admin = await User.create({
      nombre: "Administrador",
      email: "admin@pablomella.com",
      password: passwordHash,
      rol: "admin",
      esDirectiva: true,
      cargoDirectiva: "presidente",
      activo: true,
    });

    console.log("✅ Admin creado exitosamente:");
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: admin123`);
    console.log("⚠️  Recuerda cambiar la contraseña después del primer login");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createAdmin();
