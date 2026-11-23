import { http, HttpResponse, type RequestHandler } from 'msw';
import { integrationItem, integrationsView } from '../../fixtures/integrations';

export const integrationsHandlers: RequestHandler[] = [
    http.get('*/integrations', (): Response => HttpResponse.json(integrationsView())),
    http.put('*/integrations/llm', (): Response => HttpResponse.json(integrationItem('llm', true))),
    http.put('*/integrations/whatsapp', (): Response => HttpResponse.json(integrationItem('whatsapp', true))),
    http.put('*/integrations/google', (): Response => HttpResponse.json(integrationItem('google', true))),
    http.delete('*/integrations/:kind', (): Response => new HttpResponse(null, { status: 204 }))
];
