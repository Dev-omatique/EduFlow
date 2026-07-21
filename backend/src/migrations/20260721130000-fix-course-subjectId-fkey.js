'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('courses', 'courses_subjectId_fkey');
    await queryInterface.addConstraint('courses', {
      fields: ['subjectId'],
      type: 'foreign key',
      name: 'courses_subjectId_fkey',
      references: {
        table: 'subjects',
        field: 'id',
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('courses', 'courses_subjectId_fkey');
    await queryInterface.addConstraint('courses', {
      fields: ['subjectId'],
      type: 'foreign key',
      name: 'courses_subjectId_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
    });
  }
};