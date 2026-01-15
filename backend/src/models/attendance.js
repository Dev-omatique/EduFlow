'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  Attendance.init(
    {
      comment: DataTypes.STRING,
      attendanceStatusId: DataTypes.INTEGER,
      courseId: DataTypes.INTEGER,
      studentId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Attendance',
      tableName: 'attendances',
      freezeTableName: true,
    }
  );

  return Attendance;
};