import express from 'express';
import 'dotenv/config';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler, NotFoundError } from '@dstransaction/common';
import { registerationsRouter } from './routes/registerations';
import cors from 'cors';
import path from 'path';
import { reportsRouter } from './routes/reports';

const app = express();
app.use(express.static(path.join(__dirname + '/public')));
app.use(cors());
app.use(json());
app.use(
    express.urlencoded({
      extended: true,
    }),
  )

app.use(registerationsRouter);
app.use(reportsRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

//app.use(errorHandler);
export { app };