'use strict';

export default {
  async up(queryInterface, Sequelize) {
    const [roles] = await queryInterface.sequelize.query(
      'SELECT id FROM roles WHERE role = :role LIMIT 1',
      {
        replacements: { role: 'VIE_SCOLAIRE' },
      }
    );

    const [permissions] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE code = :code LIMIT 1',
      {
        replacements: { code: 'SEND_GROUP_MESSAGES' },
      }
    );

    if (roles.length === 0 || permissions.length === 0) {
      throw new Error(
        'Le rôle VIE_SCOLAIRE ou la permission SEND_GROUP_MESSAGES est introuvable.'
      );
    }

    const roleId = roles[0].id;
    const permissionId = permissions[0].id;
    const [existing] = await queryInterface.sequelize.query(
      'SELECT id FROM role_permissions WHERE "roleId" = :roleId AND "permissionId" = :permissionId LIMIT 1',
      {
        replacements: { roleId, permissionId },
      }
    );

    if (existing.length === 0) {
      await queryInterface.bulkInsert('role_permissions', [
        {
          roleId,
          permissionId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  },

  async down(queryInterface) {
    const [roles] = await queryInterface.sequelize.query(
      'SELECT id FROM roles WHERE role = :role LIMIT 1',
      {
        replacements: { role: 'VIE_SCOLAIRE' },
      }
    );

    const [permissions] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE code = :code LIMIT 1',
      {
        replacements: { code: 'SEND_GROUP_MESSAGES' },
      }
    );

    if (roles.length === 0 || permissions.length === 0) {
      return;
    }

    await queryInterface.bulkDelete('role_permissions', {
      roleId: roles[0].id,
      permissionId: permissions[0].id,
    });
  },
};
