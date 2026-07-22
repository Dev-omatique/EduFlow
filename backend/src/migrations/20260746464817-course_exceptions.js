'use strict';

export default {
  async up(queryInterface, Sequelize) {
    // Sécurité : Supprime la table si elle existe déjà pour repartir sur une base propre
    await queryInterface.dropTable('course_exceptions').catch(() => {});

    await queryInterface.createTable('course_exceptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      status_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'course_statuses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'rooms', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      note: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint('course_exceptions', {
      fields: ['course_id', 'date'],
      type: 'unique',
      name: 'course_exceptions_course_id_date_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('course_exceptions');
  }
};