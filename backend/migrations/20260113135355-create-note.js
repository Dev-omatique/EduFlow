'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      grade: {
        type: Sequelize.DECIMAL
      },
      studentId: {
        type: Sequelize.INTEGER,
        references : {
          model: "users",
          key: "id"
        }
      },
      examId: {
        type: Sequelize.INTEGER,
        references : {
          model: "exams",
          key: "id"
        }
      },
      noteStatusId: {
        type: Sequelize.INTEGER,
        references : {
          model: "note_statuses",
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
    await queryInterface.dropTable('notes');
  }
};