import { Router } from 'express';

export const playersRouter = Router();

playersRouter.get('/', (req, res) => {
  res.send('hi');
});

playersRouter.post('/', (req, res) => {
  res.status(404).send();
});

playersRouter.get('/dates', (req, res) => {
  res.status(404).send();
});
