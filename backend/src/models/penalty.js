'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Penalty extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Penalty.init({
    penaltyTypeId: DataTypes.INTEGER,
    studentId: DataTypes.INTEGER,
    responsibleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Penalty',
    tableName: 'penaltys',
    freezeTableName: true,
  });
  return Penalty;
};