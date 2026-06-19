const express = require("express");
const router = express.Router();
const {
  crearReserva,
  getReservas,
  getMisReservas,
  getCalendario,
  verificarReserva,
  cancelarReserva,
  registrarIncidente,
} = require("../controllers/reservationController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/mis-reservas", protect, getMisReservas);
router.get("/calendario", protect, getCalendario);
router.get("/", protect, adminOnly, getReservas);
router.post("/", protect, crearReserva);
router.put("/:id/verificar", protect, adminOnly, verificarReserva);
router.put("/:id/cancelar", protect, cancelarReserva);
router.put("/:id/incidente", protect, adminOnly, registrarIncidente);

module.exports = router;
