'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class CourseException extends Model {
    static associate(models) {
      CourseException.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
      CourseException.belongsTo(models.User, { foreignKey: 'teacherId', as: 'teacher' });
      CourseException.belongsTo(models.Room, { foreignKey: 'roomId', as: 'room' });
      CourseException.belongsTo(models.CourseStatus, { foreignKey: 'statusId', as: 'status' });
    }
  }

  CourseException.init({
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    roomId: DataTypes.INTEGER,
    teacherId: DataTypes.INTEGER,
    note: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CourseException',
    tableName: 'course_exceptions',
    freezeTableName: true,
  });

  return CourseException;
};