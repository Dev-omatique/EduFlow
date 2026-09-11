import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../models/index.js";

const { User } = db;

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_DURATION_MS = 15 * 60 * 1000;
const loginAttempts = new Map();

function getLoginKey(email) {
  return email.trim().toLowerCase();
}

function getLoginAttempt(key) {
  const attempt = loginAttempts.get(key);

  if (!attempt) {
    return null;
  }

  if (attempt.blockedUntil && attempt.blockedUntil <= Date.now()) {
    loginAttempts.delete(key);
    return null;
  }

  return attempt;
}

function registerFailedLogin(key) {
  const currentAttempt = getLoginAttempt(key);
  const failedAttempts = (currentAttempt?.failedAttempts ?? 0) + 1;
  const blockedUntil =
    failedAttempts >= MAX_LOGIN_ATTEMPTS
      ? Date.now() + LOGIN_BLOCK_DURATION_MS
      : null;

  loginAttempts.set(key, {
    failedAttempts,
    blockedUntil,
  });

  return blockedUntil;
}

function clearLoginAttempts(key) {
  loginAttempts.delete(key);
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

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

    const emailVerification =
      email.includes("@") && email.lastIndexOf(".") > email.indexOf("@");

    if (!emailVerification) {
      return res.status(400).json({
        message: "Email invalide",
      });
    }

    const existingUsername = await User.findOne({
      where: { username },
    });

    if (existingUsername) {
      return res.status(409).json({
        message: "Username déjà utilisé",
      });
    }

    const existingEmail = await User.findOne({
      where: { email },
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email déjà utilisé",
      });
    }

    const passwordVerification =
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password);

    if (!passwordVerification) {
      return res.status(400).json({
        message:
          "Password doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre",
      });
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

    res.cookie("access_token", token, {
      ...cookieOptions,
      maxAge: 3600000,
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

    const emailVerification =
      email.includes("@") && email.lastIndexOf(".") > email.indexOf("@");

    if (!emailVerification) {
      return res.status(400).json({
        message: "Email invalide",
      });
    }

    const loginKey = getLoginKey(email);
    const previousAttempt = getLoginAttempt(loginKey);

    if (previousAttempt?.blockedUntil) {
      const retryAfterSeconds = Math.ceil(
        (previousAttempt.blockedUntil - Date.now()) / 1000
      );

      res.set("Retry-After", String(retryAfterSeconds));

      return res.status(429).json({
        message: "Trop de tentatives. Réessayez dans 15 minutes.",
        retryAfterSeconds,
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      registerFailedLogin(loginKey);

      return res.status(401).json({
        message: "Identifiants invalides",
      });
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      registerFailedLogin(loginKey);

      return res.status(401).json({
        message: "Identifiants invalides",
      });
    }

    clearLoginAttempts(loginKey);

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("access_token", token, {
      ...cookieOptions,
      maxAge: 3600000,
    });

    return res.status(200).json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * LOGOUT
 */
export const logout = async (req, res) => {
  res.clearCookie("access_token", cookieOptions);

  return res.status(200).json({
    message: "Déconnexion réussie",
  });
};