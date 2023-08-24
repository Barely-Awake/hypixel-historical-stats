import { model, Schema } from 'mongoose';
import { ApiData } from '../types/player.js';

export interface ISnapshot {
  rawStats: ApiData;
}

const snapshotSchema = new Schema<ISnapshot>({
  rawStats: {
    type: Object,
    required: true,
  },
});

export const Snapshot = model<ISnapshot>('snapshot', snapshotSchema);
