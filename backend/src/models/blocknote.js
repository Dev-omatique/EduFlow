'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class BlockNote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BlockNote.init({
    description: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'BlockNote',
    tableName: 'block_notes',
    freezeTableName: true,
  });
  return BlockNote;
};