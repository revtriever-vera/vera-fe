import { http, HttpResponse, type RequestHandler } from 'msw';
import { emptyConversation, pendingTurn } from '../../fixtures/assistant';

export const assistantHandlers: RequestHandler[] = [
    http.get('*/assistant/conversations/current', (): Response => HttpResponse.json(emptyConversation())),
    http.delete('*/assistant/conversations/:id', (): Response => new HttpResponse(null, { status: 204 })),
    http.post('*/assistant/turns', (): Response =>
        HttpResponse.json({ turnId: 'turn-1', conversationId: 'conversation-1' }, { status: 202 })
    ),
    http.get('*/assistant/turns/:id', (): Response => HttpResponse.json(pendingTurn())),
    http.post('*/assistant/turns/:id/feedback', (): Response => new HttpResponse(null, { status: 204 }))
];
