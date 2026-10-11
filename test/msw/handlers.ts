import { http, HttpResponse, type RequestHandler } from 'msw';
import { authHandlers } from './handlers/auth.handlers';

export const handlers: RequestHandler[] = [http.get('*/health', () => HttpResponse.json({ status: 'ok' })), ...authHandlers];
