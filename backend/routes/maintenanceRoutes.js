const express = require("express");
const router = express.Router();
const {
  crearSolicitud,
  getSolicitudes,
  getMisSolicitudes,
  actualizarSolicitud,
} = require("../controllers/maintenanceController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/mis-solicitudes", protect, getMisSolicitudes);
router.get("/", protect, adminOnly, getSolicitudes);
router.post("/", protect, upload.single("foto"), crearSolicitud);
router.put("/:id", protect, adminOnly, actualizarSolicitud);

module.exports = router;
