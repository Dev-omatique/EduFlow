'use strict';

export default {
  async up(queryInterface) {
    await queryInterface.addConstraint('notes', {
      fields: ['studentId', 'examId'],
      type: 'unique',
      name: 'unique_note_student_exam',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('notes', 'unique_note_student_exam');
  },
};