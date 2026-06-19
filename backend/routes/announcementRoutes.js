const express = require("express");
const router = express.Router();
const {
  crearAnuncio,
  getAnuncios,
  getEmergencias,
  desactivarAnuncio,
  eliminarAnuncio,
} = require("../controllers/announcementController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", protect, getAnuncios);
router.get("/emergencias", protect, getEmergencias);
router.post("/", protect, adminOnly, crearAnuncio);
router.put("/:id/desactivar", protect, adminOnly, desactivarAnuncio);
router.delete("/:id", protect, adminOnly, eliminarAnuncio);

module.exports = router;
