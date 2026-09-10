import db from "../models/index.js";

const { User, Roles } = db;

export const checkRole = (allowedRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          message: "Utilisateur non authentifié",
        });
      }

      const user = await User.findOne({
        where: { id: req.user.userId },
        attributes: ["id"],
        include: [
          {
            model: Roles,
            as: "Role",
            attributes: ["role"],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          message: "Utilisateur introuvable",
        });
      }

      if (user.Role?.role?.toUpperCase() !== allowedRole.toUpperCase()) {
        return res.status(403).json({
          message: "Accès refusé : rôle insuffisant",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
