'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Exam extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Exam.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    dueDate: DataTypes.DATE,
    maxNotes: DataTypes.DECIMAL,
    coefficient: DataTypes.INTEGER,
    isGraded: DataTypes.BOOLEAN,
    subjectId: DataTypes.INTEGER,
    teacherId: DataTypes.INTEGER,
    classId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Exam',
    tableName: 'exams',
    freezeTableName: true,
  });
  return Exam;
};