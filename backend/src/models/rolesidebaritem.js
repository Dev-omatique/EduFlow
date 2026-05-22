'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class RoleSidebarItem extends Model {
    static associate(models) {
      RoleSidebarItem.belongsTo(models.Roles, {
        foreignKey: 'roleId',
      });

      RoleSidebarItem.belongsTo(models.SidebarItem, {
        foreignKey: 'sidebarItemId',
      });
    }
  }

  RoleSidebarItem.init(
    {
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      sidebarItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'RoleSidebarItem',
      tableName: 'roleSidebarItems',
      freezeTableName: true,
    }
  );

  return RoleSidebarItem;
};