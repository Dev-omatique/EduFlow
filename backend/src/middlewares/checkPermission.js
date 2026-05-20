import db from "../models/index.js";

const { User, Permission, RolePermission } = db;

export const checkPermission = (permissionCode) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          message: "Utilisateur non authentifié",
        });
      }

      const user = await User.findOne({
        where: { id: req.user.userId },
        attributes: ["id", "roleId"],
      });

      if (!user) {
        return res.status(404).json({
          message: "Utilisateur introuvable",
        });
      }

      if (!user.roleId) {
        return res.status(403).json({
          message: "Utilisateur sans rôle",
        });
      }

      const permission = await Permission.findOne({
        where: { code: permissionCode },
        attributes: ["id", "code"],
      });

      if (!permission) {
        return res.status(403).json({
          message: "Permission inconnue",
          requiredPermission: permissionCode,
        });
      }

      const rolePermission = await RolePermission.findOne({
        where: {
          roleId: user.roleId,
          permissionId: permission.id,
        },
      });

      if (!rolePermission) {
        return res.status(403).json({
          message: "Accès refusé : permission insuffisante",
          requiredPermission: permissionCode,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};