import express from 'express';
import { indexRouter } from './routes/index.js';
import { playersRouter } from './routes/players.js';

const app = express();

app.use('/', indexRouter);

app.use('/players', playersRouter);

app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

app.listen(3000, () => {
  console.log(`Listening on port ${3000}`);
});
