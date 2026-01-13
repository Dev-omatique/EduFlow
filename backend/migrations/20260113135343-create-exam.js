'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Exams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      dueDate: {
        type: Sequelize.DATE
      },
      maxGrades: {
        type: Sequelize.DECIMAL
      },
      coefficient: {
        type: Sequelize.INTEGER
      },
      isGraded: {
        type: Sequelize.BOOLEAN
      },
      subjectId: {
        type: Sequelize.INTEGER,
        references : {
          model: "Subjects",
          key: "id"
        }
      },
      teacherId: {
        type: Sequelize.INTEGER,
        references : {
          model: "Users",
          key: "id"
        }
      },
      classId: {
        type: Sequelize.INTEGER,
        references : {
          model: "Classes",
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
    await queryInterface.dropTable('Exams');
  }
};