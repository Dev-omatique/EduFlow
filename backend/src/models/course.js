'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      Course.belongsTo(models.Room, { foreignKey: 'roomId' });
      Course.belongsTo(models.Grade, { foreignKey: 'gradeId' });
      Course.belongsTo(models.User, { foreignKey: 'teacherId', as: 'teacher' });
      Course.belongsTo(models.Subject, { foreignKey: 'subjectId' });
      
      // Lien vers la table des statuts
      Course.belongsTo(models.CourseStatus, { foreignKey: 'statusId', as: 'status' });
    }
  }

  Course.init({
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    roomId: DataTypes.INTEGER,
    subjectId: DataTypes.INTEGER,
    teacherId: DataTypes.INTEGER,
    gradeId: DataTypes.INTEGER,
    recurrent: DataTypes.BOOLEAN,
    recurrentUntil: DataTypes.DATEONLY,
    statusId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Course',
    tableName: 'courses',
    freezeTableName: true,
  });

  return Course;
};