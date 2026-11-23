import { http, HttpResponse, type RequestHandler } from 'msw';

export const adminHandlers: RequestHandler[] = [
    http.get('*/platform/audit', (): Response => HttpResponse.json({ items: [] })),
    http.get('*/platform/signup-links', (): Response => HttpResponse.json({ items: [] }))
];
