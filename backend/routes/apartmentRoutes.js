const express = require("express");
const router = express.Router();
const {
  getApartamentosPorEdificio,
  getApartamento,
  asignarResidente,
  desvincularResidente,
  getApartamentosDisponibles,
} = require("../controllers/apartmentController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/disponibles", protect, adminOnly, getApartamentosDisponibles);
router.get("/edificio/:edificioId", protect, getApartamentosPorEdificio);
router.get("/:id", protect, getApartamento);
router.put("/:id/asignar-residente", protect, adminOnly, asignarResidente);
router.put(
  "/:id/desvincular-residente",
  protect,
  adminOnly,
  desvincularResidente,
);

module.exports = router;
