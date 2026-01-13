import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const BlockNote = sequelize.define('BlockNote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_note_pad'
  },
  description: {
    type: DataTypes.STRING
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'Id_users'
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
  tableName: 'block_note',
  timestamps: true
});

export default BlockNote;   