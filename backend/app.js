import express, { json, urlencoded } from 'express';
import * as dotenv from 'dotenv'
import { join } from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

var app = express();

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(logger('dev'));
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);

export default app;