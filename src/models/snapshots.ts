import { model, Schema } from 'mongoose';
import { ApiData } from '../types/player.js';

export interface ISnapshot {
  rawStats: ApiData;
  receivedAt: number;
  queriedAt: number;
}

const snapshotSchema = new Schema<ISnapshot>({
  rawStats: {
    type: Object,
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
});

export const Snapshot = model<ISnapshot>('snapshot', snapshotSchema);
