import db from "../models/index.js";

const { User, Permission, RolePermission } = db;

export const checkPermission = (permissionName) => {
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

      const rolePermission = await RolePermission.findOne({
        where: {
          roleId: user.roleId,
        },
        include: [
          {
            model: Permission,
            where: {
              name: permissionName,
            },
            attributes: ["id", "name"],
          },
        ],
      });

      if (!rolePermission) {
        return res.status(403).json({
          message: "Accès refusé : permission insuffisante",
          requiredPermission: permissionName,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};