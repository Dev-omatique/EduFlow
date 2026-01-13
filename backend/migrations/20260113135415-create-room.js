'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      capacity: {
        type: Sequelize.INTEGER
      },
      location: {
        type: Sequelize.STRING
      },
      floorNumber: {
        type: Sequelize.INTEGER
      },
      roomTypeId: {
        type: Sequelize.INTEGER,
        references : {
          model: "RoomTypes",
          key: "id"
        }
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Rooms');
  }
};