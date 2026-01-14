'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('principal_teachers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      gradeId: {
        type: Sequelize.INTEGER,
        references : {
          model: "grades",
          key: "id"
        }
      },
      teacherId: {
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
    await queryInterface.dropTable('principal_teachers');
  }
};