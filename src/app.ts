import 'dotenv/config';
import express from 'express';
import { connect } from 'mongoose';
import * as process from 'process';
import { indexRouter } from './routes/index.js';
import { playersRouter } from './routes/players.js';

startMongo();
startExpress();

function startMongo() {
  connect(process.env.MONGO_URI || '', {
    dbName: 'historical-stats',
  });
}

function startExpress() {
  const app = express();

  app.use(express.json({ limit: '500mb' }));

  app.use('/', indexRouter);

  app.use('/players', playersRouter);

  app.use((req, res) => {
    res.sendStatus(404);
  });

  app.listen(3000, () => {
    console.log(`Listening on port ${3000}`);
  });
}
