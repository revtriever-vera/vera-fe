import { http, HttpResponse, type RequestHandler } from 'msw';
import { sampleChanges } from '../../fixtures/changes';

export function changesHandlers(): RequestHandler[] {
    return [http.get('*/portfolio-watch/changes', (): Response => HttpResponse.json(sampleChanges([])))];
}
