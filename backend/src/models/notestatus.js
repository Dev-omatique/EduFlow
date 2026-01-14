'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class NoteStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  NoteStatus.init({
    status: DataTypes.STRING,
    shortStatus: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'NoteStatus',
    tableName: 'note_status',
    freezeTableName: true,
  });
  return NoteStatus;
};