// src/models/index.js
import User from './User.js';
import Role from './Role.js';
// Importe tes autres modèles ici au fur et à mesure :
// import Class from './Class.js';
// import Course from './Course.js';

// Centralise-les dans un objet
const models = {
  User,
  Role,
  // Class,
  // Course,
};

// Exporte tout d'un coup
export { User, Role }; 
export default models;