import { http, HttpResponse, type RequestHandler } from 'msw';
import { billingMe } from '../../fixtures/billing';

export const billingHandlers: RequestHandler[] = [http.get('*/billing/me', (): Response => HttpResponse.json(billingMe()))];
