import { http, HttpResponse, type RequestHandler } from 'msw';
import { billingMe } from '../../fixtures/billing';

export const billingHandlers: RequestHandler[] = [
    http.get('*/billing/me', (): Response => HttpResponse.json(billingMe())),
    http.get('*/billing/invoices', (): Response => HttpResponse.json({ items: [], page: 1, total: 0 }))
];
