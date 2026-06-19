const express = require("express");
const router = express.Router();
const {
  reportarPago,
  getPagosPendientes,
  verificarPago,
  getPagosPorApartamento,
  verificarMoroso,
  getMisPagos,
} = require("../controllers/paymentController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/mispagos", protect, getMisPagos);
router.get("/pendientes", protect, adminOnly, getPagosPendientes);
router.get("/moroso/:apartamentoId", protect, verificarMoroso);
router.get("/apartamento/:apartamentoId", protect, getPagosPorApartamento);
router.post("/", protect, upload.single("comprobante"), reportarPago);
router.put("/:id/verificar", protect, adminOnly, verificarPago);

module.exports = router;
