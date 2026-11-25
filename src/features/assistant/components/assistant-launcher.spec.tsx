import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { assistantMessage, assistantUsage, conversationWith, emptyConversation } from '../../../../test/fixtures/assistant';
import { server } from '../../../../test/msw/server';
import { renderSummaries } from '../../../../test/render-summaries';
import type { ConversationView } from '../types';
import { AssistantLauncher } from './assistant-launcher';

function serveConversation(view: ConversationView): void {
    server.use(http.get('*/assistant/conversations/current', (): Response => HttpResponse.json(view)));
}

async function openPanel(): Promise<UserEvent> {
    const user: UserEvent = userEvent.setup();
    renderSummaries(<AssistantLauncher />);
    await user.click(await screen.findByRole('button', { name: 'Perguntar à Vera' }));
    return user;
}

describe('AssistantLauncher', () => {
    it('abre o painel com foco no campo, aviso de envio e três sugestões', async () => {
        await openPanel();
        expect(await screen.findByRole('heading', { name: 'Perguntar à Vera' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Sua pergunta' })).toHaveFocus();
        expect(screen.getByText(/enviada a um modelo de linguagem, por um serviço da Vercel/)).toBeInTheDocument();
        expect(await screen.findByRole('button', { name: 'O que a Vera faz?' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Por onde eu começo?' })).toBeInTheDocument();
    });

    it('Esc fecha o painel e devolve o foco ao botão', async () => {
        const user: UserEvent = await openPanel();
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('heading', { name: 'Perguntar à Vera' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Perguntar à Vera' })).toHaveFocus();
    });

    it('o botão Fechar fecha o painel', async () => {
        const user: UserEvent = await openPanel();
        await user.click(await screen.findByRole('button', { name: 'Fechar' }));
        expect(screen.queryByRole('heading', { name: 'Perguntar à Vera' })).not.toBeInTheDocument();
    });

    it('mostra a falha ao abrir a conversa e tenta de novo', async () => {
        server.use(http.get('*/assistant/conversations/current', (): Response => HttpResponse.json({}, { status: 500 })));
        const user: UserEvent = await openPanel();
        expect(await screen.findByText('Não consegui abrir a conversa.')).toBeInTheDocument();
        serveConversation(emptyConversation());
        await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));
        expect(await screen.findByRole('button', { name: 'O que a Vera faz?' })).toBeInTheDocument();
    });
});

describe('cota', () => {
    it('mostra a faixa em 85%', async () => {
        serveConversation(emptyConversation({ usage: assistantUsage({ state: 'warning', usedBps: 8500 }) }));
        await openPanel();
        expect(await screen.findByText('85% da cota de novembro usada')).toBeInTheDocument();
    });

    it('desliga o campo e avisa a volta em 100%', async () => {
        serveConversation(emptyConversation({ usage: assistantUsage({ state: 'paused', usedBps: 10000 }) }));
        await openPanel();
        expect(await screen.findByText('Perguntas pausadas até 1º de dezembro.')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Sua pergunta' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
    });
});

describe('conversa existente', () => {
    it('mostra negrito, link interno e a nota do aviso', async () => {
        serveConversation(
            conversationWith([
                assistantMessage({ id: 'p1', role: 'person', text: 'Como aporto?' }),
                assistantMessage({
                    id: 'v1',
                    text: 'Abra **Onde aportar** em [Aportes](/portfolio/contribution).',
                    notice: 'Isto não é uma recomendação de compra ou venda.'
                })
            ])
        );
        await openPanel();
        const log: HTMLElement = await screen.findByRole('log', { name: 'Conversa' });
        expect(within(log).getByText('Onde aportar').tagName).toBe('STRONG');
        expect(within(log).getByRole('link', { name: 'Aportes' })).toHaveAttribute('href', '/portfolio/contribution');
        expect(within(log).getByText('Isto não é uma recomendação de compra ou venda.')).toBeInTheDocument();
    });

    it('mostra Consultando... enquanto o turno roda', async () => {
        serveConversation(conversationWith([assistantMessage({ id: 'v1', status: 'pending', text: '' })]));
        await openPanel();
        expect(await screen.findByText('Consultando...')).toBeInTheDocument();
    });

    it('oferece Tentar de novo no turno que falhou e reenvia a pergunta', async () => {
        const sent: unknown[] = [];
        serveConversation(
            conversationWith([
                assistantMessage({ id: 'p1', role: 'person', text: 'Pergunta antiga' }),
                assistantMessage({ id: 'v1', status: 'failed', text: '' })
            ])
        );
        server.use(
            http.post('*/assistant/turns', async ({ request }): Promise<Response> => {
                sent.push(await request.json());
                return HttpResponse.json({ turnId: 't2', conversationId: 'conversation-1' }, { status: 202 });
            })
        );
        const user: UserEvent = await openPanel();
        await user.click(await screen.findByRole('button', { name: 'Tentar de novo' }));
        await waitFor((): void => {
            expect(sent).toEqual([{ conversationId: 'conversation-1', text: 'Pergunta antiga', screen: { path: '/' } }]);
        });
    });

    it('registra Não ajudou sem texto', async () => {
        const bodies: unknown[] = [];
        serveConversation(conversationWith([assistantMessage({ id: 'v1' })]));
        server.use(
            http.post('*/assistant/turns/:id/feedback', async ({ request }): Promise<Response> => {
                bodies.push(await request.json());
                return new HttpResponse(null, { status: 204 });
            })
        );
        const user: UserEvent = await openPanel();
        await user.click(await screen.findByRole('button', { name: 'Não ajudou' }));
        expect(await screen.findByText('Anotado.')).toBeInTheDocument();
        expect(bodies).toEqual([{ helpful: false }]);
    });
});
