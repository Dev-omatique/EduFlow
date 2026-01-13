import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_classes'
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
  tableName: 'classes',
  timestamps: true
});

export default Class;
    