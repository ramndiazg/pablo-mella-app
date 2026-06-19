const express = require("express");
const router = express.Router();
const {
  crearVotacion,
  votar,
  cerrarVotacion,
  getResultados,
} = require("../controllers/voteController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/:id/resultados", protect, getResultados);
router.post("/", protect, adminOnly, crearVotacion);
router.post("/:id/votar", protect, votar);
router.put("/:id/cerrar", protect, adminOnly, cerrarVotacion);

module.exports = router;
