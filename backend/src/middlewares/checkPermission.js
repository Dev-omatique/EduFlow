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

      const permissionCodes = Array.isArray(permissionCode) ? permissionCode : [permissionCode];
      const permissions = await Permission.findAll({
        where: { code: permissionCodes },
        attributes: ["id", "code"],
      });

      if (permissions.length === 0) {
        return res.status(403).json({
          message: "Permission inconnue",
          requiredPermission: permissionCode,
        });
      }

      const rolePermissions = await RolePermission.findAll({
        where: {
          roleId: user.roleId,
          permissionId: permissions.map(({ id }) => id),
        },
      });

      if (rolePermissions.length === 0) {
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