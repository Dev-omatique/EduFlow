import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'notes'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  schoolYear: {
    type: DataTypes.DATE,
    field: 'school_year'
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
    