'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class AttendanceStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AttendanceStatus.init({
    label: DataTypes.STRING,
    shortCode: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'AttendanceStatus',
    tableName: 'attendance_status',
    freezeTableName: true,
  });
  return AttendanceStatus;
};