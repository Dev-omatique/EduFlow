'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Course.belongsTo(models.Room, { foreignKey: 'roomId' });
      Course.belongsTo(models.Grade, { foreignKey: 'gradeId' });
      Course.belongsTo(models.User, { 
          foreignKey: 'teacherId', 
          as: 'teacher'
      });
      Course.belongsTo(models.Subject, { foreignKey: 'subjectId' });
    }
  }
  Course.init({
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    roomId: DataTypes.INTEGER,
    subjectId: DataTypes.INTEGER,
    teacherId: DataTypes.INTEGER,
    gradeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Course',
    tableName: 'courses',
    freezeTableName: true,
  });
  return Course;
};