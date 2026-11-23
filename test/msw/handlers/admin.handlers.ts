import { http, HttpResponse, type RequestHandler } from 'msw';

export const adminHandlers: RequestHandler[] = [
    http.get('*/platform/audit', (): Response => HttpResponse.json({ items: [] })),
    http.get('*/platform/signup-links', (): Response => HttpResponse.json({ items: [] })),
    http.get('*/platform/overview', (): Response =>
        HttpResponse.json({ accounts: { total: 0, createdLast30Days: 0 }, plans: { free: 0, premium: 0, trials: 0 } })
    ),
    http.get('*/platform/accounts', (): Response => HttpResponse.json({ items: [], page: 1, pageSize: 25, total: 0 }))
];
