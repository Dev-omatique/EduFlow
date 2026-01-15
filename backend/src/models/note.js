'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Note extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Note.hasOne(models.Exam,{ foreignKey: "examId" })
    }
  }
  Note.init({
    grade: DataTypes.DECIMAL,
    studentId: DataTypes.INTEGER,
    examId: DataTypes.INTEGER,
    noteStatusId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Note',
    tableName: 'notes',
    freezeTableName: true,
  });
  return Note;
};