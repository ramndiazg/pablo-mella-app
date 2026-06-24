const express = require("express");
const router = express.Router();
const {
  crearIncidencia,
  getIncidencias,
  actualizarIncidencia,
  getMisIncidencias,
} = require("../controllers/incidentController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/mis-incidencias", protect, getMisIncidencias);
router.get("/", protect, adminOnly, getIncidencias);
router.post("/", protect, crearIncidencia);
router.put("/:id", protect, adminOnly, actualizarIncidencia);

module.exports = router;
