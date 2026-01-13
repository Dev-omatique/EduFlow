import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_room'
  },
  name: {
    type: DataTypes.STRING,
    unique: true
  },
  capacity: {
    type: DataTypes.INTEGER
  },
  location: {
    type: DataTypes.STRING
  },
  floor: {
    type: DataTypes.INTEGER,
    field: 'floor_number'
  },
  roomTypeId: {
    type: DataTypes.INTEGER,
    field: 'Id_room_type'
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
  tableName: 'rooms',
  timestamps: true
});

export default Room;
