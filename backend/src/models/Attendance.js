import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_attendance'
  },
  comment: {
    type: DataTypes.STRING
  },
  attendanceStatusId: {
    type: DataTypes.INTEGER,
    field: 'Id_attendance_status'
  },
  courseId: {
    type: DataTypes.INTEGER,
    field: 'Id_courses'
  },
  studentId: {
    type: DataTypes.INTEGER
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
  tableName: 'attendance',
  timestamps: true
});

export default Attendance;