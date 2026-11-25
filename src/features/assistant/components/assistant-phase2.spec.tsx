import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { assistantMessage } from '../../../../test/fixtures/assistant';
import { consentState } from '../../../../test/fixtures/summaries';
import { server } from '../../../../test/msw/server';
import { featureAccess, renderSummaries } from '../../../../test/render-summaries';
import { ASSISTANT_SLOTS } from '@/app/layouts/assistant-mount';
import { AssistantSlotsContext } from '../lib/assistant-slots';
import { AssistantMessage } from './assistant-message';

const PLAN_ANSWER: string = 'Isso é do Premium. Veja em [Plano e uso](/settings/plan).';

function renderMessage(text: string, toolsUsed: string[], options: Parameters<typeof renderSummaries>[1] = {}): void {
    renderSummaries(
        <AssistantSlotsContext value={ASSISTANT_SLOTS}>
            <ul>
                <AssistantMessage message={assistantMessage({ id: 'turn-1', text, toolsUsed })} onRetry={(): void => undefined} />
            </ul>
        </AssistantSlotsContext>,
        options
    );
}

describe('pedido de permissão no painel', () => {
    it('Premium sem permissão vê o aviso e o botão Permitir e mostrar', async () => {
        server.use(http.get('*/ai/consent', (): Response => HttpResponse.json(consentState())));
        renderMessage(PLAN_ANSWER, ['help_search']);
        expect(await screen.findByRole('button', { name: 'Permitir e mostrar' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ver o que é enviado' })).toBeInTheDocument();
    });

    it('Leitura vê o pedido sem o botão', async () => {
        server.use(http.get('*/ai/consent', (): Response => HttpResponse.json(consentState({ canChange: false }))));
        renderMessage(PLAN_ANSWER, ['help_search']);
        expect(await screen.findByText('Peça a um Dono ou Editor para permitir.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Permitir e mostrar' })).not.toBeInTheDocument();
    });

    it('com a permissão dada não mostra o pedido', async () => {
        server.use(http.get('*/ai/consent', (): Response => HttpResponse.json(consentState({ granted: true, needsConsent: false }))));
        renderMessage(PLAN_ANSWER, ['help_search']);
        expect(await screen.findByRole('link', { name: 'Plano e uso' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Permitir e mostrar' })).not.toBeInTheDocument();
    });
});

describe('Free e o cadeado do Premium', () => {
    it('mostra o cadeado com o link para Planos', async () => {
        renderMessage(PLAN_ANSWER, ['help_search'], { billing: { featureState: featureAccess('premium_required') } });
        expect(await screen.findByText('Os números da sua conta e o mercado estão no Premium.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver o Premium' })).toHaveAttribute('href', '/settings/plan');
    });

    it('sem pedido de Premium na resposta, não mostra o cadeado', async () => {
        renderMessage('Abra Gastos no menu.', ['help_search'], { billing: { featureState: featureAccess('premium_required') } });
        expect(await screen.findByText('Abra Gastos no menu.')).toBeInTheDocument();
        expect(screen.queryByText(/estão no Premium/)).not.toBeInTheDocument();
    });
});

describe('Ver o que foi enviado', () => {
    it('abre o JSON do turno', async () => {
        const sent: { tool: string; payload: Record<string, string> }[] = [
            { tool: 'portfolio_overview', payload: { total: 'R$ 120.000' } }
        ];
        server.use(http.get('*/assistant/turns/turn-1/sent', (): Response => HttpResponse.json({ sent })));
        const user: UserEvent = userEvent.setup();
        renderMessage('Sua carteira soma R$ 120.000.', ['portfolio_overview']);
        await user.click(await screen.findByRole('button', { name: 'Ver o que foi enviado' }));
        expect(await screen.findByText(/"tool": "portfolio_overview"/)).toBeInTheDocument();
    });

    it('avisa quando não há nada guardado', async () => {
        server.use(http.get('*/assistant/turns/turn-1/sent', (): Response => HttpResponse.json({ sent: [] })));
        const user: UserEvent = userEvent.setup();
        renderMessage('Sua carteira soma R$ 120.000.', ['portfolio_overview']);
        await user.click(await screen.findByRole('button', { name: 'Ver o que foi enviado' }));
        expect(await screen.findByText(/Não há nada guardado desta resposta/)).toBeInTheDocument();
    });

    it('resposta só de ajuda não tem o link', async () => {
        renderMessage('Abra Gastos no menu.', ['help_search', 'where_is']);
        expect(await screen.findByText('Abra Gastos no menu.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Ver o que foi enviado' })).not.toBeInTheDocument();
    });
});
