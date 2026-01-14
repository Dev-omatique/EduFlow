'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      comment: {
        type: Sequelize.STRING
      },
      attendanceStatusId: {
        type: Sequelize.INTEGER,
        references : {
          model: "attendance_statuses",
          key: "id"
        }
      },
      courseId: {
        type: Sequelize.INTEGER,
        references : {
          model: "courses",
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
    await queryInterface.dropTable('attendances');
  }
};