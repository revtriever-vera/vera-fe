import { setupServer, type SetupServer } from 'msw/node';
import { handlers } from './handlers';

export const server: SetupServer = setupServer(...handlers);
