import cluster from 'cluster';
import 'dotenv/config';
import express from 'express';
import { connect } from 'mongoose';
import { availableParallelism } from 'os';
import { indexRouter } from './routes/index.js';
import { playersRouter } from './routes/players.js';

process.on('unhandledRejection', console.warn);
process.on('uncaughtException', console.warn);

if (
  cluster.isPrimary &&
  availableParallelism() > 1 &&
  process.env.USE_THREADING !== 'false'
) {
  for (let i = 0; i < availableParallelism(); i++) {
    cluster.fork();
  }

  cluster.on('disconnect', (worker) => {
    console.log(`Worker ${worker.id.toString().padStart(2, '0')} died!`);
  });

  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.id.toString().padStart(2, '0')} started!`);
  });
} else {
  startMongo();
  startExpress();
}

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
