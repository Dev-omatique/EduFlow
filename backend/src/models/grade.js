'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Grade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Grade.init({
    name: DataTypes.STRING,
    schoolYear: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Grade',
    tableName: 'grades',
    freezeTableName: true,
  });
  return Grade;
};