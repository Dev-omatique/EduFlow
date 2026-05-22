'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class SidebarItem extends Model {
    static associate(models) {
      SidebarItem.hasMany(models.SidebarItem, {
        as: 'children',
        foreignKey: 'parentId',
      });

      SidebarItem.belongsTo(models.SidebarItem, {
        as: 'parent',
        foreignKey: 'parentId',
      });

      SidebarItem.belongsToMany(models.Roles, {
        through: models.RoleSidebarItem,
        foreignKey: 'sidebarItemId',
        otherKey: 'roleId',
        as: 'roles',
      });

      SidebarItem.hasMany(models.RoleSidebarItem, {
        foreignKey: 'sidebarItemId',
      });
    }
  }

  SidebarItem.init(
    {
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      navigation: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      ordre: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'SidebarItem',
      tableName: 'sidebarItems',
      freezeTableName: true,
    }
  );

  return SidebarItem;
};