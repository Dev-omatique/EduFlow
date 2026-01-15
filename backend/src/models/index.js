'use strict';

import { readdirSync } from 'fs';
import { basename, join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Sequelize from 'sequelize';
import { env as processEnv } from 'process';

import configFile from '../config/config.js'; // ton config exporte un objet { development, test, production }

// ESM replacement for __filename / __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const base = basename(__filename);
const env = processEnv.NODE_ENV || 'development';
const config = configFile[env]; // ✅ pas de conflit de nom

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(processEnv[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Charger tous les models (factory) du dossier models/
const files = readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf('.') !== 0 &&
    file !== base &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  );
});

// ESM: import dynamique + exécution de la factory
for (const file of files) {
  const moduleUrl = pathToFileURL(join(__dirname, file)).href;
  const modelModule = await import(moduleUrl);

  // modelModule.default = (sequelize, DataTypes) => Model
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// Associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;