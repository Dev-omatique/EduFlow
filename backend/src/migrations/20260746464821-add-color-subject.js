'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('subjects', 'color', {
      type: Sequelize.STRING(7), // Limité à 7 caractères, parfait pour un code hexadécimal (ex: #FF5733)
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('subjects', 'color');
  }
};