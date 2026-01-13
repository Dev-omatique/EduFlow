import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_grades'
  },
  grades: {
    type: DataTypes.DECIMAL
  },
  studentId: {
    type: DataTypes.INTEGER,
    field: 'student_id'
  },
  examId: {
    type: DataTypes.INTEGER,
    field: 'Id_exams'
  },
  gradesStatusId: {
    type: DataTypes.INTEGER,
    field: 'Id_grades_status'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'grades',
  timestamps: true
});

export default Grade;