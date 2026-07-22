'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('sidebarItems', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },

    nom: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    navigation: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    parentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'sidebarItems',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    ordre: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    icon: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    isActive: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },

    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('sidebarItems');
}