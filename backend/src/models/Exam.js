import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_exams'
  },
  title: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.STRING
  },
  dueDate: {
    type: DataTypes.DATE,
    field: 'due_date'
  },
  maxGrades: {
    type: DataTypes.DECIMAL,
    field: 'max_grades'
  },
  coefficient: {
    type: DataTypes.INTEGER
  },
  isGraded: {
    type: DataTypes.BOOLEAN
  },
  subjectId: {
    type: DataTypes.INTEGER,
    field: 'Id_subject'
  },
  teacherId: {
    type: DataTypes.INTEGER
  },
  classId: {
    type: DataTypes.INTEGER,
    field: 'Id_classes'
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
  tableName: 'exams',
  timestamps: true
});

export default Exam;