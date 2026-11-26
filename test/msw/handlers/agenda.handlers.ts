import { http, HttpResponse, type RequestHandler } from 'msw';
import { emptyAgenda } from '../../fixtures/agenda';

export function agendaHandlers(): RequestHandler[] {
    return [http.get('*/portfolio-watch/agenda', (): Response => HttpResponse.json(emptyAgenda()))];
}
