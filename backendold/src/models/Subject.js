import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_subject'
  },
  type: {
    type: DataTypes.STRING,
    unique: true
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
  tableName: 'subject',
  timestamps: true
});

export default Subject;