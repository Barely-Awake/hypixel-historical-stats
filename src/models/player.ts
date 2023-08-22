import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export interface IPlayer {
  uuid: string;
  createdAt: number;
  data: StatsSnapshot[];
}

interface StatsSnapshot {
  rawStats: Record<string, any>;
  queriedAt: number;
  receivedAt: number;
}

const playerSchema = new Schema<IPlayer>(
  {
    uuid: {
      type: String,
      required: true,
      set: cleanUuid,
    },
    data: [
      {
        rawStats: Object,
        queriedAt: {
          type: Number,
        },
        receivedAt: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export function cleanUuid(uuid: string) {
  return uuid.replace(/-/g, '');
}

export const Player = model<IPlayer>('player', playerSchema);
