import db from '../models/index.js';

const { User, SidebarItem } = db;

const buildSidebarTree = (items) => {
  const parents = items.filter((item) => item.parentId === null);
  const children = items.filter((item) => item.parentId !== null);

  return parents.map((parent) => ({
    id: parent.id,
    nom: parent.nom,
    navigation: parent.navigation,
    icon: parent.icon,
    ordre: parent.ordre,
    subInfo: children
      .filter((child) => child.parentId === parent.id)
      .sort((a, b) => a.ordre - b.ordre)
      .map((child) => ({
        id: child.id,
        nom: child.nom,
        navigation: child.navigation,
        icon: child.icon,
        ordre: child.ordre,
      })),
  }));
};

const getMySidebar = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'roleId'],
    });

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur introuvable',
      });
    }

    const sidebarItems = await SidebarItem.findAll({
      where: {
        isActive: true,
      },
      include: [
        {
          model: db.Roles,
          as: 'roles',
          where: {
            id: user.roleId,
          },
          attributes: [],
          through: {
            attributes: [],
          },
        },
      ],
      order: [
        ['ordre', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    const sidebar = buildSidebarTree(sidebarItems);

    return res.status(200).json(sidebar);
  } catch (error) {
    next(error);
  }
};

export default {
  getMySidebar,
};