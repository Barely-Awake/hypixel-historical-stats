import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export interface Player {
  uuid: string;
  createdAt: number;
  data: StatsSnapshot[];
}

interface StatsSnapshot {
  rawStats: Record<string, any>;
  queriedAt: number;
  receivedAt: number;
}
