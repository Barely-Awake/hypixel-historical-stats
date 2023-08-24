import { Router } from 'express';
import { Types } from 'mongoose';
import { Player } from '../models/player.js';
import { Snapshot } from '../models/snapshots.js';
import { PlayerUpdates } from '../types/api.js';

export const playersRouter = Router();

playersRouter.get('/', (req, res) => {
  res.sendStatus(404);
});

playersRouter.post('/', async (req, res) => {
  const updates: PlayerUpdates = req.body;
  const receivedAt = Date.now();

  if (!updates || !Array.isArray(updates)) {
    return res.sendStatus(400);
  }

  if (updates.length <= 0) {
    return res.sendStatus(400);
  }

  res.sendStatus(202);

  const snapshots = updates.map(
    (player) =>
      new Snapshot({
        _id: new Types.ObjectId(),
        rawStats: player.hypixelStats,
      }),
  );

  Snapshot.insertMany(snapshots);

  const playerUpdates = updates.map((player, index) => {
    const {hypixelStats} = player;

    return {
      updateOne: {
        filter: {
          uuid: hypixelStats.uuid,
        },
        update: {
          $push: {
            data: {
              snapshotId: snapshots[index]._id,
              receivedAt: receivedAt,
              queriedAt: Number(player.queriedAt) ?? undefined,
            },
          },
        },
        upsert: true,
      },
    };
  });

  await Player.bulkWrite(playerUpdates);
});

playersRouter.get('/dates', (req, res) => {
  res.sendStatus(404);
});
