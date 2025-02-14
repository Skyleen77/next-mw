import { middlewares, config } from 'next-mw/src/index';

import * as authMiddleware from './middlewares/auth-middleware';
import * as adminMiddleware from './middlewares/admin-middleware';

export const middleware = middlewares(authMiddleware, adminMiddleware);

export { config };
