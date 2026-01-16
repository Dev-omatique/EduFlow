'use strict';

module.exports = {
  async up (queryInterface) {
    await queryInterface.bulkInsert('subjects', [
      {
        type: 'math',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('subjects', null, {});
  }
};

