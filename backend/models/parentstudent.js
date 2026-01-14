'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ParentStudent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ParentStudent.init({
    studentId: DataTypes.INTEGER,
    parentId: DataTypes.INTEGER,
    parentTypeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ParentStudent',
    tableName: 'parent_students',
    freezeTableName: true,
  });
  return ParentStudent;
};