import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Penalty = sequelize.define('Penalty', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_penalty'
  },
  penaltyTypeId: {
    type: DataTypes.INTEGER,
    field: 'Id_penalty_type'
  },
  studentId: {
    type: DataTypes.INTEGER
  },
  responsibleId: {
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
  tableName: 'penalty',
  timestamps: true
});

export default Penalty;