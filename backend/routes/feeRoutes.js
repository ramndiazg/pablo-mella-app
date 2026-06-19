const express = require("express");
const router = express.Router();
const {
  crearCuota,
  getCuotas,
  getCuota,
  getResumenMensual,
} = require("../controllers/feeController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/resumen/:mes/:anio", protect, adminOnly, getResumenMensual);
router.get("/", protect, getCuotas);
router.get("/:id", protect, adminOnly, getCuota);
router.post("/", protect, adminOnly, crearCuota);

module.exports = router;
