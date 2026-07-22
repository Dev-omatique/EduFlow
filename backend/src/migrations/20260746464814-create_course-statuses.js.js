'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('course_statuses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nom: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      created_at: { // snake_case obligatoire avec underscored: true
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Insertion des valeurs de base par défaut
    await queryInterface.bulkInsert('course_statuses', [
      { nom: 'annulé', created_at: new Date(), updated_at: new Date() },
      { nom: 'modifié', created_at: new Date(), updated_at: new Date() },
      { nom: 'déplacé', created_at: new Date(), updated_at: new Date() },
      { nom: 'prof abs.', created_at: new Date(), updated_at: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('course_statuses');
  }
};