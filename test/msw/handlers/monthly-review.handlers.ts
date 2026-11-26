import { http, HttpResponse, type RequestHandler } from 'msw';

export function monthlyReviewHandlers(): RequestHandler[] {
    return [http.get('*/portfolio-watch/monthly-reviews', (): Response => HttpResponse.json({ items: [] }))];
}
