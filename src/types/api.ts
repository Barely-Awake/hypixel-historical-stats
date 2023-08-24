import { Types } from 'mongoose';
import { ApiData } from './player.js';

export type SnapshotIds = {
  [index: number]: Types.ObjectId;
};

export type PlayerUpdates = PlayerUpdate[];

export interface PlayerUpdate {
  queriedAt: string;
  hypixelStats: ApiData;
}
