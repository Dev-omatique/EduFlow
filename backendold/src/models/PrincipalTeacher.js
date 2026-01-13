import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const PrincipalTeacher = sequelize.define('PrincipalTeacher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_principal_teacher'
  },
  classId: {
    type: DataTypes.INTEGER,
    field: 'Id_classes'
  },
  teacherId: {
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
  tableName: 'principal_teacher',
  timestamps: true
});

export default PrincipalTeacher;