import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../models/index.js";

const { User } = db;

/**
 * REGISTER
 */
export const register = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      birthDate,
      address,
      gradeId,
      roleId,
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "username, email et password requis",
      });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: "Username déjà utilisé" });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }

    // 🔐 Hash obligatoire
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: passwordHash,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      birthDate: birthDate ?? null,
      address: address ?? null,
      gradeId: gradeId ?? null,
      roleId: roleId ?? null,
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * LOGIN avec Cookie HttpOnly
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email et password requis",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        message: "Identifiants invalides",
      });
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({
        message: "Identifiants invalides",
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // --- MODIFICATION ICI ---
    res.cookie('access_token', token, {
      httpOnly: true,                // Empêche le JS côté client de lire le cookie
      sameSite: 'lax',               // Protection CSRF standard
      maxAge: 3600000,               // 1 heure en millisecondes (doit matcher l'expiresIn du JWT)
      path: '/',                     // Disponible sur tout ton site
    });

    // On ne renvoie plus le token dans le JSON pour plus de sécurité
    return res.status(200).json({ 
      message: "Connexion réussie",
      user: { id: user.id, email: user.email } // Optionnel : renvoie les infos de base
    });
    
  } catch (err) {
    return next(err);
  }
};