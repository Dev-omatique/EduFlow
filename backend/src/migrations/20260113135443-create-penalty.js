'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('penalties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      penaltyTypeId: {
        type: Sequelize.INTEGER,
        references : {
          model: "penalty_types",
          key: "id"
        }
      },
      studentId: {
        type: Sequelize.INTEGER,
        references : {
          model: "users",
          key: "id"
        }
      },
      responsibleId: {
        type: Sequelize.INTEGER,
        references : {
          model: "users",
          key: "id"
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('penalties');
  }
};