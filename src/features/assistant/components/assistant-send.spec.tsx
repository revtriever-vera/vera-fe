import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { assistantMessage, assistantUsage, conversationWith, emptyConversation, pendingTurn } from '../../../../test/fixtures/assistant';
import { server } from '../../../../test/msw/server';
import { renderSummaries } from '../../../../test/render-summaries';
import type { ConversationView, TurnView } from '../types';
import { AssistantLauncher } from './assistant-launcher';

interface Backend {
    readonly bodies: unknown[];
    readonly deleted: string[];
}

function installBackend(finalTurn: TurnView): Backend {
    const backend: Backend = { bodies: [], deleted: [] };
    let view: ConversationView = emptyConversation();
    let polls: number = 0;
    server.use(
        http.get('*/assistant/conversations/current', (): Response => HttpResponse.json(view)),
        http.post('*/assistant/turns', async ({ request }): Promise<Response> => {
            backend.bodies.push(await request.json());
            view = conversationWith([
                assistantMessage({ id: 'p1', role: 'person', text: 'Como funciona Onde aportar?' }),
                assistantMessage({ id: 't1', status: 'pending', text: '' })
            ]);
            return HttpResponse.json({ turnId: 't1', conversationId: 'conversation-1' }, { status: 202 });
        }),
        http.get('*/assistant/turns/:id', (): Response => {
            polls += 1;
            if (polls < 2) {
                return HttpResponse.json(pendingTurn());
            }
            view = conversationWith([
                assistantMessage({ id: 'p1', role: 'person', text: 'Como funciona Onde aportar?' }),
                assistantMessage({ id: 't1', text: 'Ela soma o aporte pelas metas.' })
            ]);
            return HttpResponse.json(finalTurn);
        }),
        http.delete('*/assistant/conversations/:id', ({ params }): Response => {
            backend.deleted.push(String(params['id']));
            return new HttpResponse(null, { status: 204 });
        })
    );
    return backend;
}

async function ask(user: UserEvent, text: string): Promise<void> {
    await user.click(await screen.findByRole('button', { name: 'Perguntar à Vera' }));
    await user.type(await screen.findByRole('textbox', { name: 'Sua pergunta' }), `${text}{Enter}`);
}

describe('enviar uma pergunta', () => {
    it('envia com a tela atual, mostra Consultando... e depois a resposta', async () => {
        const backend: Backend = installBackend(pendingTurn({ status: 'done' }));
        const user: UserEvent = userEvent.setup();
        renderSummaries(<AssistantLauncher />);
        await ask(user, 'Como funciona Onde aportar?');
        expect(await screen.findByText('Consultando...')).toBeInTheDocument();
        expect(await screen.findByText('Ela soma o aporte pelas metas.', undefined, { timeout: 6000 })).toBeInTheDocument();
        expect(backend.bodies).toEqual([{ text: 'Como funciona Onde aportar?', screen: { path: '/' } }]);
        expect(screen.getByRole('textbox', { name: 'Sua pergunta' })).toHaveValue('');
    });

    it('uma sugestão envia a pergunta direto', async () => {
        const backend: Backend = installBackend(pendingTurn({ status: 'done' }));
        const user: UserEvent = userEvent.setup();
        renderSummaries(<AssistantLauncher />);
        await user.click(await screen.findByRole('button', { name: 'Perguntar à Vera' }));
        await user.click(await screen.findByRole('button', { name: 'Por onde eu começo?' }));
        await waitFor((): void => {
            expect(backend.bodies).toEqual([{ text: 'Por onde eu começo?', screen: { path: '/' } }]);
        });
    });

    it('mostra o aviso de cota quando o teto estoura', async () => {
        server.use(
            http.post('*/assistant/turns', (): Response =>
                HttpResponse.json(
                    {
                        type: 'usage.cap_reached',
                        title: 'cap',
                        status: 402,
                        detail: 'cap',
                        requestId: 'r',
                        meta: { resetsAt: assistantUsage().resetsAt }
                    },
                    { status: 402 }
                )
            )
        );
        const user: UserEvent = userEvent.setup();
        renderSummaries(<AssistantLauncher />);
        await ask(user, 'Oi');
        expect(await screen.findByText('Perguntas pausadas até 1º de dezembro.')).toBeInTheDocument();
    });
});

describe('apagar conversa', () => {
    it('confirma antes de apagar', async () => {
        const backend: Backend = installBackend(pendingTurn({ status: 'done' }));
        const user: UserEvent = userEvent.setup();
        server.use(
            http.get('*/assistant/conversations/current', (): Response =>
                HttpResponse.json(conversationWith([assistantMessage({ id: 'p1', role: 'person', text: 'Oi' })]))
            )
        );
        renderSummaries(<AssistantLauncher />);
        await user.click(await screen.findByRole('button', { name: 'Perguntar à Vera' }));
        await user.click(await screen.findByRole('button', { name: 'Apagar conversa' }));
        expect(backend.deleted).toEqual([]);
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Apagar conversa' }));
        await waitFor((): void => {
            expect(backend.deleted).toEqual(['conversation-1']);
        });
    });
});
