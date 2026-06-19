const express = require("express");
const router = express.Router();
const {
  crearMulta,
  getMultas,
  getMisMultas,
  pagarMulta,
  anularMulta,
} = require("../controllers/fineController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/mis-multas", protect, getMisMultas);
router.get("/", protect, adminOnly, getMultas);
router.post("/", protect, adminOnly, crearMulta);
router.put("/:id/pagar", protect, upload.single("comprobantePago"), pagarMulta);
router.put("/:id/anular", protect, adminOnly, anularMulta);

module.exports = router;
