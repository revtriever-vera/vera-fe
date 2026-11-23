import { http, HttpResponse, type RequestHandler } from 'msw';
import { emptyGoals, noSpendingSuggestion } from '../../fixtures/goals';

export function goalsHandlers(): RequestHandler[] {
    return [
        http.get('*/goals', (): Response => HttpResponse.json(emptyGoals())),
        http.get('*/goals/emergency-suggestion', ({ request }): Response =>
            HttpResponse.json(noSpendingSuggestion(Number(new URL(request.url).searchParams.get('months') ?? 6)))
        )
    ];
}
