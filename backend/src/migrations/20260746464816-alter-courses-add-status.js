'use strict';

export default {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('courses');
    
    // On ajoute la colonne uniquement si elle n'existe pas encore
    if (!tableInfo.status_id) {
      await queryInterface.addColumn('courses', 'status_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'course_statuses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('courses');
    
    // On supprime la colonne uniquement si elle existe
    if (tableInfo.status_id) {
      await queryInterface.removeColumn('courses', 'status_id');
    }
  }
};