'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'recurrent', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('courses', 'recurrentUntil', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('courses', 'recurrentUntil');
    await queryInterface.removeColumn('courses', 'recurrent');
  }
};