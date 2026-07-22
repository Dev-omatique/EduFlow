'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('course_statuses', 'nom', 'label');

    await queryInterface.removeConstraint('course_exceptions', 'course_exceptions_course_id_date_unique').catch(() => {});
    await queryInterface.removeConstraint('course_exceptions', 'course_exceptions_courseId_date_unique').catch(() => {});

    await queryInterface.removeColumn('course_exceptions', 'date');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('course_statuses', 'name', 'label');

    await queryInterface.addColumn('course_exceptions', 'date', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
  }
};