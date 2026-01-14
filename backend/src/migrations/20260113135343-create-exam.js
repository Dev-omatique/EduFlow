'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exams', {
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
      maxNotes: {
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
          model: "subjects",
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
      gradeId: {
        type: Sequelize.INTEGER,
        references : {
          model: "grades",
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
    await queryInterface.dropTable('exams');
  }
};