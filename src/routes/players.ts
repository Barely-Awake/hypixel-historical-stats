import { Router } from 'express';

export const playersRouter = Router();

playersRouter.get('/', (req, res) => {
  res.sendStatus(404);
});

playersRouter.post('/', (req, res) => {
  res.sendStatus(404);
});

playersRouter.get('/dates', (req, res) => {
  res.sendStatus(404);
});
