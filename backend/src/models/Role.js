import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Role = sequelize.define('Role', {
  // Correspond à : id Int @id @default(autoincrement()) @map("Id_role")
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_role' // Le nom réel de la colonne dans la base SQL
  },
  // Correspond à : role String @unique
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  // Correspond à : createdAt @map("created_at")
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  // Correspond à : updatedAt @map("updated_at")
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  // Correspond à : @@map("roles")
  tableName: 'roles', 
  timestamps: true // Active la gestion auto de createdAt/updatedAt
});

export default Role;