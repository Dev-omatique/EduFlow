'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'tag', {
      type: Sequelize.STRING,
      allowNull: true,
      // Valeurs attendues côté applicatif : 'annule' | 'modifie' | 'deplace' | null
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('courses', 'tag');
  }
};
