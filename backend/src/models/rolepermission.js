'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {
      RolePermission.belongsTo(models.Roles, {
        foreignKey: "roleId",
      });

      RolePermission.belongsTo(models.Permission, {
        foreignKey: "permissionId",
      });
    }
  }

  RolePermission.init({
    roleId: DataTypes.INTEGER,
    permissionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'RolePermission',
    tableName: 'role_permissions',
    freezeTableName: true,
  });

  return RolePermission;
};