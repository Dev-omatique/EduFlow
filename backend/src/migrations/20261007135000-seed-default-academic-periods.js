'use strict';

const periods = [
  { label: 'Trimestre 1', periodType: 'TRIMESTER', number: 1, schoolYear: '2025-2026', startDate: '2025-09-01', endDate: '2025-12-31' },
  { label: 'Trimestre 2', periodType: 'TRIMESTER', number: 2, schoolYear: '2025-2026', startDate: '2026-01-01', endDate: '2026-03-31' },
  { label: 'Trimestre 3', periodType: 'TRIMESTER', number: 3, schoolYear: '2025-2026', startDate: '2026-04-01', endDate: '2026-08-31' },
  { label: 'Trimestre 1', periodType: 'TRIMESTER', number: 1, schoolYear: '2026-2027', startDate: '2026-09-01', endDate: '2026-12-31' },
  { label: 'Trimestre 2', periodType: 'TRIMESTER', number: 2, schoolYear: '2026-2027', startDate: '2027-01-01', endDate: '2027-03-31' },
  { label: 'Trimestre 3', periodType: 'TRIMESTER', number: 3, schoolYear: '2026-2027', startDate: '2027-04-01', endDate: '2027-08-31' },
];

export default {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('academic_periods', periods.map((period) => ({
      ...period,
      createdAt: now,
      updatedAt: now,
    })));

    await queryInterface.sequelize.query(`
      UPDATE "exams" AS exam
      SET "academicPeriodId" = period.id
      FROM "academic_periods" AS period
      WHERE exam."academicPeriodId" IS NULL
        AND period."periodType" = 'TRIMESTER'
        AND exam."dueDate"::date BETWEEN period."startDate" AND period."endDate"
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE "exams"
      SET "academicPeriodId" = NULL
      WHERE "academicPeriodId" IN (
        SELECT id FROM "academic_periods"
        WHERE "schoolYear" IN ('2025-2026', '2026-2027')
          AND "periodType" = 'TRIMESTER'
      )
    `);

    await queryInterface.bulkDelete('academic_periods', {
      schoolYear: ['2025-2026', '2026-2027'],
      periodType: 'TRIMESTER',
    });
  },
};