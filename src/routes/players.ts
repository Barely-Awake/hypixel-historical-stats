import { Router } from 'express';
import { Document, Types } from 'mongoose';
import { authCheck } from '../middleware/auth.js';
import { cleanUuid, Player } from '../models/player.js';
import { ISnapshot, Snapshot } from '../models/snapshots.js';
import { PlayerUpdate, PlayerUpdates } from '../types/api.js';

export const playersRouter = Router();

playersRouter.get('/', authCheck(), async (req, res) => {
  // Separated due to TypeScript checking reasons (https://github.com/microsoft/TypeScript/issues/9998)
  const {uuid} = req.query;
  let {date: dates} = req.query;

  if (typeof uuid !== 'string') {
    res.sendStatus(400);
    return;
  }

  if (!isUuid(uuid)) {
    res.sendStatus(400);
    return;
  }

  if (!dates || (typeof dates !== 'string' && !Array.isArray(dates))) {
    res.sendStatus(400);
    return;
  }

  if (!Array.isArray(dates)) {
    dates = [dates];
  }

  const parsedDates: number[] = [];

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    if (typeof date !== 'string' || !Number(date)) {
      console.log(typeof date);
      res.sendStatus(400);
      return;
    }

    parsedDates[i] = Number(date);
  }

  const [snapshotInfo] = await Player.aggregate()
    .allowDiskUse(true)
    .match({uuid: cleanUuid(uuid)})
    .limit(1)
    .project({
      _id: 0,
      uuid: 1,
      data: {
        $filter: {
          input: '$data',
          cond: {
            $in: ['$$this.queriedAt', parsedDates],
          },
        },
      },
    })
    .exec();

  const snapshotData = await Snapshot.find({
    _id: {
      $in: snapshotInfo.data.map((data: any) => data.snapshotId),
    },
  });

  snapshotInfo.data = snapshotInfo.data.map((data: any) => {
    return {
      receivedAt: data.receivedAt,
      queriedAt: data.queriedAt,
      rawStats: snapshotData.find(
        (snapshotData) =>
          snapshotData._id.toHexString() === data.snapshotId.toHexString(),
      )?.rawStats,
    };
  });

  res.send(snapshotInfo);
});

playersRouter.post(
  '/',
  authCheck({
    requirePermissions: ['write'],
  }),
  async (req, res) => {
    const updates: PlayerUpdates | unknown = req.body;
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
          error: `${playerStatus.reason} (index ${i})`,
        });
        return;
      }

      snapshots.push(
        new Snapshot({
          _id: new Types.ObjectId(),
          receivedAt: receivedAt,
          queriedAt: player.queriedAt || receivedAt,
          rawStats: player.hypixelStats,
        }),
      );
    }

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
                queriedAt: player.queriedAt || receivedAt,
              },
            },
          },
          upsert: true,
        },
      };
    });

    await Player.bulkWrite(playerUpdates);

    res.sendStatus(202);
  },
);

function validatePlayer(
  player: PlayerUpdate | unknown,
): PlayerValid | PlayerInvalid {
  if (!player || typeof player !== 'object') {
    return {
      valid: false,
      reason: 'invalid player provided',
      code: 400,
    };
  }

  if (
    !('hypixelStats' in player) ||
    typeof player.hypixelStats !== 'object' ||
    !player.hypixelStats
  ) {
    return {
      valid: false,
      reason: 'required property "hypixelStats" missing',
      code: 400,
    };
  }

  const {hypixelStats} = player;

  if (
    !('uuid' in hypixelStats) ||
    typeof hypixelStats.uuid !== 'string' ||
    !isUuid(hypixelStats.uuid)
  ) {
    return {
      valid: false,
      reason: 'player has invalid uuid',
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

playersRouter.get('/dates', authCheck(), async (req, res) => {
  const {uuid} = req.query;

  if (typeof uuid !== 'string' || !isUuid(uuid)) {
    res.sendStatus(400);
    return;
  }

  const [dates] = await Player.aggregate()
    .allowDiskUse(true)
    .match({
      uuid: cleanUuid(uuid),
    })
    .limit(1)
    .project({
      _id: 0,
      uuid: 1,
      dates: {
        $map: {
          input: '$data',
          in: '$$this.queriedAt',
        },
      },
    })
    .exec();

  if (!dates) {
    res.status(200).send({
      uuid: uuid,
      dates: [],
    });
    return;
  }

  console.log(dates);

  res.status(200).send(dates);
});

export function isUuid(uuid: string) {
  const uuidRegex =
    /^[0-9A-F]{8}-?[0-9A-F]{4}-?4[0-9A-F]{3}-?[89AB][0-9A-F]{3}-?[0-9A-F]{12}$/i;
  return uuidRegex.test(uuid);
}
