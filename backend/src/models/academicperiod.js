'use strict';
import { Model } from 'sequelize';

function academicPeriodModel(sequelize, DataTypes) {
  class AcademicPeriod extends Model {
    static associate(models) {
      AcademicPeriod.hasMany(models.Exam, {
        foreignKey: 'academicPeriodId',
        as: 'Exams',
      });
    }
  }

  AcademicPeriod.init({
    label: DataTypes.STRING,
    periodType: DataTypes.STRING,
    number: DataTypes.INTEGER,
    schoolYear: DataTypes.STRING,
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
  }, {
    sequelize,
    modelName: 'AcademicPeriod',
    tableName: 'academic_periods',
    freezeTableName: true,
  });

  return AcademicPeriod;
}

export default academicPeriodModel;