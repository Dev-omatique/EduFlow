import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const RolePermission = sequelize.define('RolePermission', {
  roleId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'Id_role'
  },
  permissionId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'Id_permission'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'role_permission',
  timestamps: true
});

export default RolePermission;