const express = require("express");
const router = express.Router();
const {
  login,
  register,
  getPerfil,
  cambiarPassword,
  getUsuarios,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/auth");

// Rutas públicas
router.post("/login", login);

// Rutas privadas (solo admin puede registrar usuarios)
router.post("/register", protect, adminOnly, register);
router.get("/usuarios", protect, adminOnly, getUsuarios);

// Rutas privadas (cualquier usuario autenticado)
router.get("/perfil", protect, getPerfil);
router.put("/cambiar-password", protect, cambiarPassword);

module.exports = router;
