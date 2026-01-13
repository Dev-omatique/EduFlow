import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Role from './Role.js'; 
// import Class from './Class.js'; // À décommenter quand tu auras créé Class.js

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id_users'
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true, // Équivalent de String?
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'last_name'
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'birth_date'
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  },
  // On définit les IDs de relation pour correspondre à tes @map
  classId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'Id_classes'
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Id_role'
  }
}, {
  tableName: 'users',
  timestamps: true // Gère auto created_at et updated_at
});

// --- DÉFINITION DES RELATIONS ---

// Relation avec Role
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId' });

// Relation avec Class (À activer une fois le modèle Class créé)
/*
User.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Class.hasMany(User, { foreignKey: 'classId' });
*/

export default User;