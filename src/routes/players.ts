import { Router } from 'express';
import { Document, Types } from 'mongoose';
import { Player } from '../models/player.js';
import { ISnapshot, Snapshot } from '../models/snapshots.js';
import { PlayerUpdate, PlayerUpdates } from '../types/api.js';

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

  const snapshots: (Document<unknown, {}, ISnapshot> &
    ISnapshot & { _id: Types.ObjectId })[] = [];

  for (let i = 0; i < updates.length; i++) {
    const player = updates[i];

    const playerStatus = validatePlayer(player);
    if (!playerStatus.valid) {
      res.status(playerStatus.code).send({
        error: playerStatus.reason,
      });
      return;
    }

    snapshots.push(
      new Snapshot({
        _id: new Types.ObjectId(),
        rawStats: player.hypixelStats,
      })
    );
  }

  Snapshot.insertMany(snapshots);

  const playerUpdates = updates.map((player, index) => {
    const { hypixelStats } = player;

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
              queriedAt: Number(player.queriedAt) ?? receivedAt,
            },
          },
        },
        upsert: true,
      },
    };
  });

  await Player.bulkWrite(playerUpdates);

  res.sendStatus(202);
});

function validatePlayer(player: PlayerUpdate): PlayerValid | PlayerInvalid {
  if (
    !player.hypixelStats ||
    typeof player.hypixelStats !== 'object' ||
    typeof player.hypixelStats.uuid !== 'string'
  ) {
    return {
      valid: false,
      reason: 'required property "hypixelStats" missing',
      code: 400,
    };
  }

  return {
    valid: true,
    reason: null,
    code: null,
  };
}

interface PlayerValid {
  valid: true;
  reason: null;
  code: null;
}

interface PlayerInvalid {
  valid: false;
  reason: string;
  code: number;
}

playersRouter.get('/dates', (req, res) => {
  res.sendStatus(404);
});
