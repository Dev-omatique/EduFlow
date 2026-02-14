import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../models/index.js";

const { User } = db;

/**
 * REGISTER
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

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

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: passwordHash,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 3600000,
      path: '/',
    });

    return res.status(201).json({
      message: "Utilisateur créé et connecté avec succès",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * LOGIN
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

    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',    
      secure : false,
      maxAge: 3600000,
      path: '/',
    });

    return res.status(200).json({ 
      message: "Connexion réussie",
      user: { id: user.id, email: user.email }
    });
    
  } catch (err) {
    return next(err);
  }
};