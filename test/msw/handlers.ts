import { http, HttpResponse, type RequestHandler } from 'msw';

export const handlers: RequestHandler[] = [http.get('*/health', () => HttpResponse.json({ status: 'ok' }))];
