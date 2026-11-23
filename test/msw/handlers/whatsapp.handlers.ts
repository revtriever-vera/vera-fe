import { http, HttpResponse, type RequestHandler } from 'msw';
import { issuedCode, linkView, remindersView } from '../../fixtures/whatsapp';

export const whatsappHandlers: RequestHandler[] = [
    http.get('*/whatsapp/link', (): Response => HttpResponse.json(linkView())),
    http.post('*/whatsapp/link/code', (): Response => HttpResponse.json(issuedCode())),
    http.delete('*/whatsapp/link', (): Response => new HttpResponse(null, { status: 204 })),
    http.get('*/reminders', (): Response => HttpResponse.json(remindersView())),
    http.delete('*/reminders/:id', (): Response => new HttpResponse(null, { status: 204 }))
];
