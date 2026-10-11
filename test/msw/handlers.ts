import { http, HttpResponse, type RequestHandler } from 'msw';
import { authHandlers } from './handlers/auth.handlers';
import { portfolioHandlers } from './handlers/portfolio.handlers';

export const handlers: RequestHandler[] = [
    http.get('*/health', () => HttpResponse.json({ status: 'ok' })),
    ...authHandlers,
    ...portfolioHandlers()
];
