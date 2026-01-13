'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Attendances', {
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
          model: "AttendanceStatuses",
          key: "id"
        }
      },
      courseId: {
        type: Sequelize.INTEGER,
        references : {
          model: "Courses",
          key: "id"
        }
      },
      studentId: {
        type: Sequelize.INTEGER,
        references : {
          model: "Users",
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
    await queryInterface.dropTable('Attendances');
  }
};