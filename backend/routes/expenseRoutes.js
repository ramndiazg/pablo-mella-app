const express = require("express");
const router = express.Router();
const {
  crearGasto,
  getGastos,
  getResumenGastos,
  eliminarGasto,
} = require("../controllers/expenseController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/resumen", protect, adminOnly, getResumenGastos);
router.get("/", protect, getGastos);
router.post("/", protect, adminOnly, upload.single("factura"), crearGasto);
router.delete("/:id", protect, adminOnly, eliminarGasto);

module.exports = router;
