import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const ParentStudent = sequelize.define('ParentStudent', {
  studentId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  parentId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  parentTypeId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'Id_parent_type'
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
  tableName: 'parent_student',
  timestamps: true
});

export default ParentStudent;