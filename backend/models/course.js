'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Course.init({
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    roomId: DataTypes.INTEGER,
    subjectId: DataTypes.INTEGER,
    teacherId: DataTypes.INTEGER,
    classId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Course',
    tableName: 'courses',
    freezeTableName: true,
  });
  return Course;
};