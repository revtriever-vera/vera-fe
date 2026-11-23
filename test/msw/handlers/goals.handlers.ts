import { http, HttpResponse, type RequestHandler } from 'msw';
import { emptyGoals } from '../../fixtures/goals';

export function goalsHandlers(): RequestHandler[] {
    return [http.get('*/goals', (): Response => HttpResponse.json(emptyGoals()))];
}
