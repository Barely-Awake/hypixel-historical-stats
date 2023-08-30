import cluster from 'cluster';
import 'dotenv/config';
import express from 'express';
import { connect } from 'mongoose';
import { availableParallelism } from 'os';
import { ExpressServer, SlashCreator } from 'slash-create';
import ApiKeyCommand from './discord/api_key.js';
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
  const creator = new SlashCreator({
    applicationID: process.env.DISCORD_CLIENT_ID ?? '',
    publicKey: process.env.DISCORD_PUBLIC_KEY ?? '',
    token: process.env.DISCORD_TOKEN ?? '',
  });
  const app = express();

  app.use(express.json({ limit: '500mb' }));

  app.use('/', indexRouter);

  app.use('/players', playersRouter);

  app.listen(3000, () => {
    console.log(`Listening on port ${3000}`);
  });

  creator
    .withServer(
      new ExpressServer(app, {
        alreadyListening: true,
      })
    )
    .registerCommand(ApiKeyCommand)
    .syncCommands()
    .on('commandError', (command, err, ctx) => {
      console.log(
        `Error running command ${command.commandName}.\nError:\n`,
        err,
        '\nContext:\n',
        ctx,
        'Command:\n',
        command
      );
    });
}
