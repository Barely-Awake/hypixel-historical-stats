import { Router } from 'express';
import redoc from 'redoc-express';

export const indexRouter = Router();

indexRouter.get(
  '/',
  redoc({
    title: 'Historical Stats API',
    specUrl: './swagger.json',
  })
);

indexRouter.get('/swagger.json', (req, res) => {
  res.sendFile('./assets/swagger.json', { root: '.' });
});
