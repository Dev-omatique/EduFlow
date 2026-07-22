'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Roles extends Model {
    static associate(models) {
      Roles.hasMany(models.User, { foreignKey: 'roleId' });

      Roles.belongsToMany(models.SidebarItem, {
        through: models.RoleSidebarItem,
        foreignKey: 'roleId',
        otherKey: 'sidebarItemId',
        as: 'sidebarItems',
      });

      Roles.hasMany(models.RoleSidebarItem, {
        foreignKey: 'roleId',
      });
    }
  }

  Roles.init(
    {
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Roles',
      tableName: 'roles',
      freezeTableName: true,
    }
  );

  return Roles;
};