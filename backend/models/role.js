'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Roles extends Model {

    static associate(models) {
    }
  }
  Roles.init({
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Roles',
  });
  return Roles;
};