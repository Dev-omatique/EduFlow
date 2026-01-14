'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ParentType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ParentType.init({
    representative: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ParentType',
    tableName: 'parent_types',
    freezeTableName: true,
  });
  return ParentType;
};