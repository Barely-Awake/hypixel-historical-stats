import express from 'express';
import mongoose from 'mongoose';
import * as process from 'process';
import { indexRouter } from './routes/index.js';
import { playersRouter } from './routes/players.js';

import 'dotenv/config';

startMongo();
startExpress();

function startMongo() {
  mongoose.connect(process.env.MONGO_URI || '', {
    dbName: 'historical-stats',
  });
}

function startExpress() {
  const app = express();

  app.use('/', indexRouter);

  app.use('/players', playersRouter);

  app.use((req, res) => {
    res.sendStatus(404);
  });

  app.listen(3000, () => {
    console.log(`Listening on port ${3000}`);
  });
}
