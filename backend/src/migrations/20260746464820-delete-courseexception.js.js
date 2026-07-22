'use strict';

export default {
  async up(queryInterface, Sequelize) {

    // Supprimer entièrement la table course_exceptions
    await queryInterface.dropTable('course_exceptions');
  },

  async down(queryInterface, Sequelize) {

    // Recréer la table en cas de rollback (adaptez les colonnes si nécessaire)
    await queryInterface.createTable('course_exceptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      courseId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: true
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
  }
};