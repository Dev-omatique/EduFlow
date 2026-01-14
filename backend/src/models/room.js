'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Room.init({
    name: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
    location: DataTypes.STRING,
    floorNumber: DataTypes.INTEGER,
    roomTypeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Room',
    tableName: 'rooms',
    freezeTableName: true,
  });
  return Room;
};