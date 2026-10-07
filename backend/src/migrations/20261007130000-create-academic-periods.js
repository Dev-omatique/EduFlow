'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('academic_periods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      label: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      periodType: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      number: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      schoolYear: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      startDate: {
        allowNull: true,
        type: Sequelize.DATEONLY,
      },
      endDate: {
        allowNull: true,
        type: Sequelize.DATEONLY,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addConstraint('academic_periods', {
      fields: ['periodType', 'schoolYear', 'number'],
      type: 'unique',
      name: 'unique_academic_period_per_school_year',
    });

    await queryInterface.addColumn('exams', 'academicPeriodId', {
      allowNull: true,
      type: Sequelize.INTEGER,
      references: {
        model: 'academic_periods',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('exams', 'academicPeriodId');
    await queryInterface.dropTable('academic_periods');
  },
};