import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_notes'
  },
  notes: {
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
  notesStatusId: {
    type: DataTypes.INTEGER,
    field: 'Id_notes_status'
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
  tableName: 'notes',
  timestamps: true
});

export default Grade;