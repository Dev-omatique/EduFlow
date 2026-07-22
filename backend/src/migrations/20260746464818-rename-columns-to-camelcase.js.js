'use strict';

export default {
  async up(queryInterface, Sequelize) {
    // 1. Table course_statuses
    await queryInterface.renameColumn('course_statuses', 'created_at', 'createdAt');
    await queryInterface.renameColumn('course_statuses', 'updated_at', 'updatedAt');

    // 2. Table courses
    await queryInterface.renameColumn('courses', 'status_id', 'statusId');

    // 3. Table course_exceptions
    await queryInterface.renameColumn('course_exceptions', 'course_id', 'courseId');
    await queryInterface.renameColumn('course_exceptions', 'status_id', 'statusId');
    await queryInterface.renameColumn('course_exceptions', 'start_time', 'startTime');
    await queryInterface.renameColumn('course_exceptions', 'end_time', 'endTime');
    await queryInterface.renameColumn('course_exceptions', 'room_id', 'roomId');
    await queryInterface.renameColumn('course_exceptions', 'teacher_id', 'teacherId');
    await queryInterface.renameColumn('course_exceptions', 'created_at', 'createdAt');
    await queryInterface.renameColumn('course_exceptions', 'updated_at', 'updatedAt');
  },

  async down(queryInterface, Sequelize) {
    // Rollback (retour au snake_case)
    await queryInterface.renameColumn('course_statuses', 'createdAt', 'created_at');
    await queryInterface.renameColumn('course_statuses', 'updatedAt', 'updated_at');

    await queryInterface.renameColumn('courses', 'statusId', 'status_id');

    await queryInterface.renameColumn('course_exceptions', 'courseId', 'course_id');
    await queryInterface.renameColumn('course_exceptions', 'statusId', 'status_id');
    await queryInterface.renameColumn('course_exceptions', 'startTime', 'start_time');
    await queryInterface.renameColumn('course_exceptions', 'endTime', 'end_time');
    await queryInterface.renameColumn('course_exceptions', 'roomId', 'room_id');
    await queryInterface.renameColumn('course_exceptions', 'teacherId', 'teacher_id');
    await queryInterface.renameColumn('course_exceptions', 'createdAt', 'created_at');
    await queryInterface.renameColumn('course_exceptions', 'updatedAt', 'updated_at');
  }
};