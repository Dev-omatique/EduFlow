'use strict';

export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE "exams" AS exam
      SET "academicPeriodId" = COALESCE(
        (
          SELECT period.id
          FROM "academic_periods" AS period
          WHERE period."periodType" = 'TRIMESTER'
            AND period.number = 1
            AND period."schoolYear" = CASE
              WHEN EXTRACT(MONTH FROM COALESCE(exam."dueDate", CURRENT_DATE)) >= 9
                THEN EXTRACT(YEAR FROM COALESCE(exam."dueDate", CURRENT_DATE))::int::text
                  || '-'
                  || (EXTRACT(YEAR FROM COALESCE(exam."dueDate", CURRENT_DATE))::int + 1)::text
              ELSE (EXTRACT(YEAR FROM COALESCE(exam."dueDate", CURRENT_DATE))::int - 1)::text
                || '-'
                || EXTRACT(YEAR FROM COALESCE(exam."dueDate", CURRENT_DATE))::int::text
            END
          LIMIT 1
        ),
        (
          SELECT period.id
          FROM "academic_periods" AS period
          WHERE period."periodType" = 'TRIMESTER'
            AND period.number = 1
          ORDER BY period."schoolYear" DESC
          LIMIT 1
        )
      )
      WHERE exam."academicPeriodId" IS NULL
        AND EXISTS (
          SELECT 1
          FROM "academic_periods" AS period
          WHERE period."periodType" = 'TRIMESTER'
            AND period.number = 1
        )
    `);
  },

  async down() {
    throw new Error('This data backfill is intentionally irreversible to avoid clearing periods assigned by users.');
  },
};