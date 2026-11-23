import { http, HttpResponse, type RequestHandler } from 'msw';
import { connectionView, eventsView, GOOGLE_URL } from '../../fixtures/calendar';

export const calendarHandlers: RequestHandler[] = [
    http.get('*/calendar/connection', (): Response => HttpResponse.json(connectionView())),
    http.get('*/calendar/events', (): Response => HttpResponse.json(eventsView())),
    http.get('*/calendar/google/start', (): Response => HttpResponse.json({ url: GOOGLE_URL })),
    http.delete('*/calendar/connection', (): Response => new HttpResponse(null, { status: 204 }))
];
