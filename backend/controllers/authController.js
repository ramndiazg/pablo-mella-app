const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Apartment = require("../models/Apartment");

// Generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res
        .status(400)
        .json({ mensaje: "Email y contraseña son requeridos" });
    }

    // Buscar usuario
    const user = await User.findOne({ email }).populate("apartamentoId");

    if (!user || !user.activo) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, user.password);

    if (!passwordValido) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    res.json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      apartamentoId: user.apartamentoId,
      esDirectiva: user.esDirectiva,
      cargoDirectiva: user.cargoDirectiva,
      telefono: user.telefono,
      token: generarToken(user._id),
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Crear usuario (solo admin)
// @route   POST /api/auth/register
// @access  Private/Admin
const register = async (req, res) => {
  try {
    const {
      nombre,
      email,
      password,
      rol,
      apartamentoId,
      telefono,
      esDirectiva,
      cargoDirectiva,
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res
        .status(400)
        .json({ mensaje: "Nombre, email y contraseña son requeridos" });
    }

    // Verificar si el email ya existe
    const usuarioExiste = await User.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = await User.create({
      nombre,
      email,
      password: passwordHash,
      rol: rol || "residente",
      apartamentoId: apartamentoId || null,
      telefono: telefono || null,
      esDirectiva: esDirectiva || false,
      cargoDirectiva: cargoDirectiva || null,
    });

    // Si se asignó apartamento, actualizar residenteActualId en el apartamento
    if (apartamentoId) {
      await Apartment.findByIdAndUpdate(apartamentoId, {
        residenteActualId: user._id,
      });
    }

    res.status(201).json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      apartamentoId: user.apartamentoId,
      esDirectiva: user.esDirectiva,
      cargoDirectiva: user.cargoDirectiva,
      token: generarToken(user._id),
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Obtener perfil del usuario logueado
// @route   GET /api/auth/perfil
// @access  Private
const getPerfil = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "apartamentoId",
        populate: { path: "edificioId" },
      });

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Cambiar contraseña
// @route   PUT /api/auth/cambiar-password
// @access  Private
const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;

    if (!passwordActual || !passwordNuevo) {
      return res
        .status(400)
        .json({ mensaje: "Ambas contraseñas son requeridas" });
    }

    const user = await User.findById(req.user._id);

    const passwordValido = await bcrypt.compare(passwordActual, user.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: "Contraseña actual incorrecta" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(passwordNuevo, salt);
    await user.save();

    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// @desc    Listar todos los usuarios (solo admin)
// @route   GET /api/auth/usuarios
// @access  Private/Admin
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find({ activo: true })
      .select("-password")
      .populate("apartamentoId", "numero")
      .sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

module.exports = { login, register, getPerfil, cambiarPassword, getUsuarios };
