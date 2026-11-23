import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { installCutsApi } from '../../../test/helpers/cuts-api';
import { installOverviewApi } from '../../../test/helpers/overview-api';
import { canonicalSummary } from '../../../test/fixtures/spending';
import { consentState, grantedConsent, summaryView } from '../../../test/fixtures/summaries';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

vi.mock('@/shared/lib/analytics', () => ({ track: vi.fn(), initAnalytics: vi.fn(), resetAnalytics: vi.fn(), identify: vi.fn() }));

function installAi(kind: string, paragraph: string): { readonly requests: URLSearchParams[] } {
    const requests: URLSearchParams[] = [];
    let consent = consentState();
    server.use(
        http.get('*/ai/consent', (): Response => HttpResponse.json(consent)),
        http.put('*/ai/consent', (): Response => {
            consent = grantedConsent();
            return HttpResponse.json(consent);
        }),
        http.get('*/ai/summaries/:kind', ({ request, params }): Response => {
            requests.push(new URL(request.url).searchParams);
            return params['kind'] === kind
                ? HttpResponse.json(summaryView({ paragraphs: [paragraph] }))
                : new HttpResponse(null, { status: 204 });
        })
    );
    return { requests };
}

describe('cartões de resumo nas telas', () => {
    it('Resumo do mês: o cartão entra depois dos indicadores e "Permitir e mostrar" mostra o texto', async () => {
        const user: UserEvent = userEvent.setup();
        server.use(http.get('*/spending/summary', (): Response => HttpResponse.json(canonicalSummary())));
        installAi('month', 'Texto do mês **R$ 1**');
        renderRouterAt('/spending', { signedIn: true });

        const allow: HTMLElement = await screen.findByRole('button', { name: 'Permitir e mostrar' });
        expect(
            within(allow.closest('[role="region"]') as HTMLElement).getByRole('heading', { name: 'Resumo de setembro' })
        ).toBeInTheDocument();
        await user.click(allow);

        expect(await screen.findByText(/Texto do mês/)).toBeInTheDocument();
    });

    it('Onde cortar: o cartão fecha a tela e manda o mês', async () => {
        installCutsApi();
        const { requests } = installAi('cuts', 'Texto dos cortes');
        server.use(http.get('*/ai/consent', (): Response => HttpResponse.json(grantedConsent())));
        renderRouterAt('/spending/cuts?month=2026-09', { signedIn: true });

        expect(await screen.findByText('Texto dos cortes')).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Como chegar à meta de economia' })).toBeInTheDocument();
        await waitFor(() => {
            expect(requests[0]?.get('month')).toBe('2026-09');
        });
    });

    it('Visão geral: o cartão da carteira aparece na tela', async () => {
        installOverviewApi();
        installAi('portfolio', 'Texto da carteira');
        server.use(http.get('*/ai/consent', (): Response => HttpResponse.json(grantedConsent())));
        renderRouterAt('/portfolio', { signedIn: true });

        expect(await screen.findByText('Texto da carteira')).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Resumo da carteira' })).toBeInTheDocument();
    });

    it('Dados e privacidade: o cartão com o interruptor entra na aba', async () => {
        server.use(http.get('*/ai/consent', (): Response => HttpResponse.json(grantedConsent())));
        renderRouterAt('/settings/privacy', { signedIn: true });

        expect(await screen.findByRole('region', { name: 'Resumos em texto' })).toBeInTheDocument();
        expect(await screen.findByRole('switch', { name: 'Permitir o envio de totais agregados' })).toBeChecked();
    });
});
