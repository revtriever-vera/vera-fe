import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { AnyRouter } from '@tanstack/react-router';
import { server } from '../../../test/msw/server';
import { onboardingState, onboardingSummary } from '../../../test/fixtures/onboarding';
import { renderRouterAt } from '../../../test/router';
import type { OnboardingSummary } from '@/features/onboarding/types';

function serveBanks(summary: OnboardingSummary): void {
    server.use(
        http.get('*/onboarding', () => HttpResponse.json(onboardingState({ status: 'banks' }))),
        http.get('*/onboarding/summary', () => HttpResponse.json(summary))
    );
}

describe('etapa Bancos na rota', () => {
    it('Ir para Conexões abre a tela de Conexões', async () => {
        serveBanks(onboardingSummary());
        const router: AnyRouter = renderRouterAt('/onboarding/banks', { signedIn: true });

        await userEvent.click(await screen.findByRole('link', { name: /Ir para Conexões/ }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/spending/connections');
        });
        expect(router.state.location.search).toEqual({});
    });

    it('o link de importação abre Conexões com o modal de importação', async () => {
        serveBanks(onboardingSummary());
        const router: AnyRouter = renderRouterAt('/onboarding/banks', { signedIn: true });

        await userEvent.click(await screen.findByRole('link', { name: /Importe um extrato do seu banco/ }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/spending/connections');
        });
        expect(router.state.location.search).toEqual({ import: true });
        expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('depois de conectar e importar, a etapa mostra a contagem e Continuar', async () => {
        serveBanks(
            onboardingSummary({ banks: { items: 3, amountCents: null, currency: null, breakdown: { connections: 2, imports: 1 } } })
        );
        renderRouterAt('/onboarding/banks', { signedIn: true });

        expect(await screen.findByText('2 conexões bancárias · 1 extrato importado')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
    });

    it('os dados de exemplo não marcam a etapa como feita', async () => {
        serveBanks(onboardingSummary({ banks: { items: 0, amountCents: null, currency: null } }));
        renderRouterAt('/onboarding/banks', { signedIn: true });

        expect(await screen.findByRole('button', { name: 'Pular por enquanto' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument();
        expect(screen.queryByText('Bancos conectados')).not.toBeInTheDocument();
    });
});
