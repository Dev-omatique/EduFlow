'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class PrincipalTeacher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PrincipalTeacher.belongsTo(models.Grade, {
        foreignKey: 'gradeId',
        as: 'Grade',
      });

      PrincipalTeacher.belongsTo(models.User, {
        foreignKey: 'teacherId',
        as: 'Teacher',
      });
    }
  }
  PrincipalTeacher.init({
    gradeId: DataTypes.INTEGER,
    teacherId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PrincipalTeacher',
    tableName: 'principal_teachers',
    freezeTableName: true,
  });
  return PrincipalTeacher;
};