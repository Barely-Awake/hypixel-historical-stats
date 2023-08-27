import { model, Schema, Types } from 'mongoose';

export interface IPlayer {
  uuid: string;
  createdAt: number;
  data: StatsSnapshot[];
}

export interface StatsSnapshot {
  snapshotId: Types.ObjectId;
  receivedAt: number;
  queriedAt: number;
}

const playerSchema = new Schema<IPlayer>(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      set: cleanUuid,
    },
    data: [
      {
        snapshotId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        receivedAt: {
          type: Number,
          required: true,
        },
        queriedAt: {
          type: Number,
          required: true,
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
