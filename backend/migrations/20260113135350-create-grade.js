'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Grades', {
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
          model: "Users",
          key: "id"
        }
      },
      examId: {
        type: Sequelize.INTEGER,
        references : {
          model: "Exams",
          key: "id"
        }
      },
      gradeStatusId: {
        type: Sequelize.INTEGER,
        references : {
          model: "GradeStatus",
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
    await queryInterface.dropTable('Grades');
  }
};