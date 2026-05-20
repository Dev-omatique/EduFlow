'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Roles extends Model {
    static associate(models) {
      Roles.hasMany(models.User, { foreignKey: 'roleId' });
    }
  }

  Roles.init(
    {
      role: DataTypes.STRING
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