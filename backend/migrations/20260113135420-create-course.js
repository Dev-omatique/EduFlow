'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      startTime: {
        type: Sequelize.DATE
      },
      endTime: {
        type: Sequelize.DATE
      },
      roomId: {
        type: Sequelize.INTEGER,
        references : {
          model: "rooms",
          key: "id"
        }
      },
      subjectId: {
        type: Sequelize.INTEGER,
        references : {
          model: "users",
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
    await queryInterface.dropTable('courses');
  }
};