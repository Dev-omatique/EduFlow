'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class CourseStatus extends Model {
    static associate(models) {
      CourseStatus.hasMany(models.CourseException, { foreignKey: 'statusId', as: 'exceptions' });
      CourseStatus.hasMany(models.Course, { foreignKey: 'statusId', as: 'courses' });
    }
  }

  CourseStatus.init({
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'CourseStatus',
    tableName: 'course_statuses',
    freezeTableName: true,
  });

  return CourseStatus;
};