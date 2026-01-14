'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class News extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  News.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    file: DataTypes.STRING,
    responsibleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'News',
    tableName: 'news',
    freezeTableName: true,
  });
  return News;
};