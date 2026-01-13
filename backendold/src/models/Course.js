import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_courses'
  },
  startTime: {
    type: DataTypes.DATE
  },
  endTime: {
    type: DataTypes.DATE
  },
  roomId: {
    type: DataTypes.INTEGER,
    field: 'Id_room'
  },
  subjectId: {
    type: DataTypes.INTEGER,
    field: 'Id_subject'
  },
  teacherId: {
    type: DataTypes.INTEGER,
    field: 'teacher_id'
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
  tableName: 'courses',
  timestamps: true
});

export default Course;