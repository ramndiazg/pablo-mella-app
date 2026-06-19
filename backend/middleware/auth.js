const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ mensaje: "No autorizado, token requerido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user || !req.user.activo) {
      return res
        .status(401)
        .json({ mensaje: "Usuario no autorizado o inactivo" });
    }

    next();
  } catch (error) {
    res.status(401).json({ mensaje: "Token inválido" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.rol === "admin") {
    next();
  } else {
    res.status(403).json({ mensaje: "Acceso solo para administradores" });
  }
};

module.exports = { protect, adminOnly };
