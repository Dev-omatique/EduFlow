'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Roles, { foreignKey: 'roleId', as: 'Role' });
      User.belongsTo(models.Grade, { foreignKey: 'gradeId' });
    }
  }

  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    birthDate: DataTypes.DATE,
    address: DataTypes.STRING,
    gradeId: DataTypes.INTEGER,
    roleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    freezeTableName: true,
  });

  return User;
};