import { http, HttpResponse, type RequestHandler } from 'msw';
import { actionSummary, actionView, emptyConversation, pendingTurn } from '../../fixtures/assistant';

export const assistantHandlers: RequestHandler[] = [
    http.get('*/assistant/conversations/current', (): Response => HttpResponse.json(emptyConversation())),
    http.delete('*/assistant/conversations/:id', (): Response => new HttpResponse(null, { status: 204 })),
    http.post('*/assistant/turns', (): Response =>
        HttpResponse.json({ turnId: 'turn-1', conversationId: 'conversation-1' }, { status: 202 })
    ),
    http.get('*/assistant/turns/:id', (): Response => HttpResponse.json(pendingTurn())),
    http.get('*/assistant/actions/:id', (): Response => HttpResponse.json(actionView())),
    http.post('*/assistant/actions/:id/confirm', (): Response =>
        HttpResponse.json(actionSummary({ status: 'confirmed', resultText: 'Objetivo criado: viagem, R$ 12.000 até dezembro de 2027.' }))
    ),
    http.post('*/assistant/actions/:id/cancel', (): Response => HttpResponse.json(actionSummary({ status: 'canceled' }))),
    http.post('*/assistant/turns/:id/feedback', (): Response => new HttpResponse(null, { status: 204 }))
];
