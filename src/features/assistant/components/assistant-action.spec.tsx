import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { actionCandidate, actionSummary, actionView } from '../../../../test/fixtures/assistant';
import { server } from '../../../../test/msw/server';
import { renderSummaries } from '../../../../test/render-summaries';
import type { ActionSummary, ActionView } from '../types';
import { AssistantAction } from './assistant-action';

function renderAction(action: ActionSummary, onAskAgain: () => void = (): void => undefined, role: 'owner' | 'viewer' = 'owner'): void {
    renderSummaries(<AssistantAction action={action} onAskAgain={onAskAgain} />, { identity: { role } });
}

function serveView(view: ActionView): void {
    server.use(http.get('*/assistant/actions/:id', (): Response => HttpResponse.json(view)));
}

function problem(type: string, status: number): Response {
    return HttpResponse.json({ type, title: type, status, detail: type, requestId: 'req-1' }, { status });
}

describe('cartão de ação aberta', () => {
    it('mostra o que vai mudar e confirma sem escolha, com o estado Feito e o link', async () => {
        const user: UserEvent = userEvent.setup();
        renderAction(actionSummary());
        expect(await screen.findByText(/Criar o objetivo viagem/)).toBeInTheDocument();
        await user.click(await screen.findByRole('button', { name: 'Confirmar' }));
        expect(await screen.findByText('Feito')).toBeInTheDocument();
        expect(screen.getByText(/Objetivo criado: viagem/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver objetivos' })).toHaveAttribute('href', '/portfolio/goals');
    });

    it('cancela e diz que nada foi alterado', async () => {
        const user: UserEvent = userEvent.setup();
        renderAction(actionSummary());
        await user.click(await screen.findByRole('button', { name: 'Cancelar' }));
        expect(await screen.findByText('Cancelado. Nada foi alterado.')).toBeInTheDocument();
    });

    it('Leitura vê a proposta sem os botões', async () => {
        renderAction(actionSummary(), undefined, 'viewer');
        expect(await screen.findByText('Só Dono ou Editor confirmam.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument();
    });
});

describe('categorizar: escolha da transação', () => {
    const view: ActionView = actionView({
        tool: 'transaction_categorize',
        candidates: [actionCandidate(), actionCandidate({ id: 'tx-2', version: 'v2', description: 'SPOTIFY', amountMinor: -2190 })]
    });

    it('só confirma depois de escolher e manda a transação e a versão escolhidas', async () => {
        serveView(view);
        const sent: unknown[] = [];
        server.use(
            http.post('*/assistant/actions/:id/confirm', async ({ request }): Promise<Response> => {
                sent.push(await request.json());
                return HttpResponse.json(
                    actionSummary({ tool: 'transaction_categorize', status: 'confirmed', resultText: 'Categorizada.' })
                );
            })
        );
        const user: UserEvent = userEvent.setup();
        renderAction(actionSummary({ tool: 'transaction_categorize' }));
        expect(await screen.findByText('NETFLIX.COM')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
        await user.click(screen.getByRole('radio', { name: /SPOTIFY/ }));
        await user.click(screen.getByRole('button', { name: 'Confirmar' }));
        expect(await screen.findByRole('link', { name: 'Ver transações' })).toHaveAttribute('href', '/spending/transactions');
        expect(sent).toEqual([{ transactionId: 'tx-2', version: 'v2' }]);
    });
});

describe('erros e estados finais', () => {
    it('409 de estado mudado mostra o texto próprio', async () => {
        server.use(http.post('*/assistant/actions/:id/confirm', (): Response => problem('assistant.confirmation_stale', 409)));
        const user: UserEvent = userEvent.setup();
        renderAction(actionSummary());
        await user.click(await screen.findByRole('button', { name: 'Confirmar' }));
        expect(await screen.findByText('O que eu ia fazer mudou desde que propus. Nada foi alterado.')).toBeInTheDocument();
    });

    it('estado mudado vindo da conversa oferece Ver de novo', async () => {
        const onAskAgain: () => void = vi.fn();
        const user: UserEvent = userEvent.setup();
        renderAction(actionSummary({ status: 'stale' }), onAskAgain);
        await user.click(await screen.findByRole('button', { name: 'Ver de novo' }));
        expect(onAskAgain).toHaveBeenCalledTimes(1);
    });

    it('prazo vencido oferece Ver de novo', async () => {
        renderAction(actionSummary({ status: 'expired' }));
        expect(await screen.findByText('O prazo para confirmar acabou. Nada foi alterado.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ver de novo' })).toBeInTheDocument();
    });

    it('ação já resolvida em outra aba mostra o erro traduzido', async () => {
        server.use(http.post('*/assistant/actions/:id/confirm', (): Response => problem('assistant.action_resolved', 409)));
        const user: UserEvent = userEvent.setup();
        renderAction(actionSummary());
        await user.click(await screen.findByRole('button', { name: 'Confirmar' }));
        expect(await screen.findByText('Esta ação já foi resolvida.')).toBeInTheDocument();
    });

    it('mostra o Feito de uma ação já confirmada', async () => {
        renderAction(actionSummary({ status: 'confirmed', resultText: 'Objetivo criado.' }));
        expect(await screen.findByText('Feito')).toBeInTheDocument();
        expect(screen.getByText('Objetivo criado.')).toBeInTheDocument();
    });
});
