'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ParentStudents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      studentId: {
        type: Sequelize.INTEGER,
        references : {
          model: "Users",
          key: "id"
        }
      },
      parentId: {
        type: Sequelize.INTEGER,
        references : {
          model: "Users",
          key: "id"
        }
      },
      parentTypeId: {
        type: Sequelize.INTEGER,
        references : {
          model: "ParentTypes",
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
    await queryInterface.dropTable('ParentStudents');
  }
};