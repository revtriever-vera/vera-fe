import { http, HttpResponse, type RequestHandler } from 'msw';
import { consentState } from '../../fixtures/summaries';

export const summariesHandlers: RequestHandler[] = [
    http.get('*/ai/consent', (): Response => HttpResponse.json(consentState({ available: false }))),
    http.put('*/ai/consent', (): Response => HttpResponse.json(consentState({ granted: true, needsConsent: false }))),
    http.delete('*/ai/consent', (): Response => new HttpResponse(null, { status: 204 })),
    http.get('*/ai/summaries/:kind', (): Response => new HttpResponse(null, { status: 204 })),
    http.post('*/ai/summaries/:kind/regenerate', (): Response => new HttpResponse(null, { status: 204 })),
    http.get('*/ai/payload', (): Response => new HttpResponse(null, { status: 204 }))
];
