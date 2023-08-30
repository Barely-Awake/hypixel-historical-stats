import { RequestHandler } from 'express';
import { ApiKey, Permission } from '../models/api_key.js';
import { isUuid } from '../routes/players.js';

export function authCheck(options?: AuthCheckOptions): RequestHandler {
  return async (req, res, next) => {
    const apiKey = req.header('API-Key');

    if (typeof apiKey !== 'string' || !isUuid(apiKey)) {
      res.sendStatus(403);
      return;
    }

    const keyData = await ApiKey.findOne({
      apiKey: apiKey,
    });

    if (!keyData) {
      res.sendStatus(403);
      return;
    }

    if (!options || !options.requirePermissions) {
      return next();
    }

    for (let i = 0; i < options.requirePermissions.length; i++) {
      const permission = options.requirePermissions[i];

      if (!keyData.permissions.includes(permission)) {
        res.sendStatus(403);
        return;
      }
    }

    return next();
  };
}

interface AuthCheckOptions {
  requirePermissions: Permission[] | null;
}
