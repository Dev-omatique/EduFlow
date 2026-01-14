'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class RoomType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RoomType.init({
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'RoomType',
    tableName: 'room_types',
    freezeTableName: true,
  });
  return RoomType;
};