import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AgendaResponse } from '@/features/portfolio/agenda/types';
import { problem } from '../../../test/fixtures/auth';
import { agendaItem, sampleAgenda } from '../../../test/fixtures/agenda';
import { ANA } from '../../../test/fixtures/people';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const FILTER: string = 'Filtrar por tipo';
const HOLDER: string = 'Filtrar por titular';

function serve(body: AgendaResponse): URLSearchParams[] {
    const seen: URLSearchParams[] = [];
    server.use(
        http.get('*/portfolio-watch/agenda', ({ request }): Response => {
            seen.push(new URL(request.url).searchParams);
            return HttpResponse.json(body);
        })
    );
    return seen;
}

describe('agenda da carteira', () => {
    it('a aba Agenda aparece na Carteira', async () => {
        renderRouterAt('/portfolio/agenda', { signedIn: true });
        const tabs: HTMLElement = await screen.findByRole('navigation', { name: 'Seções da carteira' });

        expect(within(tabs).getByRole('link', { name: 'Agenda' })).toHaveAttribute('aria-current', 'page');
    });

    it('pede os próximos 30 dias e lista por semana, com data, ativo, tipo e valores', async () => {
        const seen: URLSearchParams[] = serve(sampleAgenda());
        renderRouterAt('/portfolio/agenda', { signedIn: true });

        const week: HTMLElement = await screen.findByRole('region', { name: 'Semana de 30/11/2026' });
        expect(seen[0]?.get('from')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(seen[0]?.get('to')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(within(week).getByText('XPLG11')).toBeInTheDocument();
        expect(within(week).getByText('Rendimento de FII')).toBeInTheDocument();
        expect(within(week).getByText('Data-com 01/12/2026 · Pagamento 14/12/2026')).toBeInTheDocument();
        expect(within(week).getByText('R$ 0,78 por cota')).toBeInTheDocument();
        expect(within(week).getByText('Estimado para você')).toBeInTheDocument();
        expect(within(week).getByText('R$ 78,00')).toBeInTheDocument();
        expect(within(week).getByRole('link', { name: 'Abrir o documento de XPLG11' })).toHaveAttribute(
            'href',
            'https://fnet.bmfbovespa.com.br/fnet/publico/exibirDocumento?id=100'
        );
    });

    it('o vencimento de renda fixa leva para a tela de renda fixa', async () => {
        serve(sampleAgenda());
        renderRouterAt('/portfolio/agenda', { signedIn: true });

        const link: HTMLElement = await screen.findByRole('link', { name: 'Ver CDB Banco X 110% CDI em renda fixa' });

        expect(link).toHaveAttribute('href', expect.stringContaining('/portfolio/assets?'));
        expect(link).toHaveAttribute('href', expect.stringContaining('tab=fixed-income'));
    });

    it('ignora um documento que não é endereço web', async () => {
        serve({ from: '2026-11-25', to: '2026-12-25', items: [agendaItem({ documentUrl: 'javascript:alert(1)' })] });
        renderRouterAt('/portfolio/agenda', { signedIn: true });

        await screen.findByText('XPLG11');

        expect(screen.queryByRole('link', { name: 'Abrir o documento de XPLG11' })).toBeNull();
    });

    it('filtra por tipo e mostra o vazio do filtro', async () => {
        const user: UserEvent = userEvent.setup();
        serve({ from: '2026-11-25', to: '2026-12-25', items: [agendaItem()] });
        renderRouterAt('/portfolio/agenda', { signedIn: true });
        await screen.findByText('XPLG11');

        await user.click(within(screen.getByRole('radiogroup', { name: FILTER })).getByRole('radio', { name: 'Vencimentos' }));

        expect(await screen.findByText('Nenhum evento nos próximos 30 dias com este filtro.')).toBeInTheDocument();
        expect(screen.queryByText('XPLG11')).toBeNull();
    });

    it('sem eventos mostra o estado vazio', async () => {
        renderRouterAt('/portfolio/agenda', { signedIn: true });

        expect(await screen.findByText('Nenhum evento nos próximos 30 dias para os seus ativos.')).toBeInTheDocument();
    });

    it('mostra o erro traduzido e tenta de novo', async () => {
        const user: UserEvent = userEvent.setup();
        server.use(http.get('*/portfolio-watch/agenda', () => HttpResponse.json(problem('internal', 500), { status: 500 })));
        renderRouterAt('/portfolio/agenda', { signedIn: true });
        await screen.findByText('Não foi possível carregar a agenda.');

        serve(sampleAgenda());
        await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));

        expect(await screen.findByText('XPLG11')).toBeInTheDocument();
    });

    it('o filtro de pessoa vai para a API', async () => {
        const user: UserEvent = userEvent.setup();
        const seen: URLSearchParams[] = serve(sampleAgenda());
        renderRouterAt('/portfolio/agenda', { signedIn: true });
        await screen.findByText('XPLG11');

        await user.click(within(await screen.findByRole('radiogroup', { name: HOLDER })).getByRole('radio', { name: ANA.name }));

        await waitFor((): void => {
            expect(seen.at(-1)?.get('holder')).toBe(ANA.userId);
        });
    });
});
