import express, { json, urlencoded } from 'express';
import * as dotenv from 'dotenv'
import { join } from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'
import indexRouter from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import YAML from 'js-yaml';

var app = express();

dotenv.config()


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openapiPath = join(__dirname, "docs", "openapi.yml");
const fileContents = fs.readFileSync(openapiPath, "utf8");
const swaggerConfig = YAML.load(fileContents);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerConfig));


app.use(logger('dev'));
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));
app.use('/api', indexRouter);

//toujours le deniere
app.use(errorHandler);

export default app;