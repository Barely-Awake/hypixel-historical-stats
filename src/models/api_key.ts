import { model, Schema } from 'mongoose';

export interface IApiKey {
  apiKey: string;
  rateLimit: number;
  permissions: Permission[];
  ownerId: string;
}

export type Permission = 'write';

const apiKeySchema = new Schema<IApiKey>({
  apiKey: {
    type: String,
    required: true,
    unique: true,
  },
  rateLimit: {
    type: Number,
    required: true,
    default: 120,
  },
  permissions: {
    type: [String],
    required: true,
    default: [],
  },
  ownerId: {
    type: String,
    required: true,
    unique: true,
  },
});

export const ApiKey = model<IApiKey>('apikey', apiKeySchema);
