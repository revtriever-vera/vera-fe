import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { ChangesResponse } from '@/features/portfolio/changes/types';
import { problem } from '../../../test/fixtures/auth';
import { changeItem, sampleChanges } from '../../../test/fixtures/changes';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const NOTICE: string = 'Isto não é uma recomendação de compra ou venda.';

function serve(body: ChangesResponse): URLSearchParams[] {
    const seen: URLSearchParams[] = [];
    server.use(
        http.get('*/portfolio-watch/changes', ({ request }): Response => {
            seen.push(new URL(request.url).searchParams);
            return HttpResponse.json(body);
        })
    );
    return seen;
}

function serveLocked(meta: Record<string, unknown>): void {
    server.use(
        http.get('*/portfolio-watch/changes', () => HttpResponse.json({ ...problem('plan.feature_locked', 402), meta }, { status: 402 }))
    );
}

describe('o que mudou na carteira', () => {
    it('a aba aparece na Carteira e lista o item com tipo, data, resumo, peso e documento', async () => {
        const seen: URLSearchParams[] = serve(sampleChanges());
        renderRouterAt('/portfolio/changes', { signedIn: true });

        const tabs: HTMLElement = await screen.findByRole('navigation', { name: 'Seções da carteira' });
        expect(within(tabs).getByRole('link', { name: 'O que mudou' })).toHaveAttribute('aria-current', 'page');
        expect(await screen.findByText('XPLG11')).toBeInTheDocument();
        expect(seen[0]?.get('days')).toBe('7');
        expect(screen.getByText('Fato relevante')).toBeInTheDocument();
        expect(screen.getByText('24/11/2026')).toBeInTheDocument();
        expect(screen.getByText('O fundo anunciou uma nova emissão de cotas para comprar dois galpões.')).toBeInTheDocument();
        expect(screen.getByText('XPLG11 é 8% da sua carteira.')).toBeInTheDocument();
        const link: HTMLElement = screen.getByRole('link', { name: 'Ver documento de XPLG11' });
        expect(link).toHaveAttribute('href', 'https://fnet.bmfbovespa.com.br/fnet/publico/exibirDocumento?id=200');
        expect(link).toHaveAttribute('target', '_blank');
        expect(screen.getByText(NOTICE)).toBeInTheDocument();
    });

    it('item sem resumo mostra título, link e Resumo indisponível', async () => {
        serve(
            sampleChanges([
                changeItem({ summaryAvailable: false, summary: 'Resumo indisponível', kind: null, relevance: null, title: 'ITR 3T26' })
            ])
        );
        renderRouterAt('/portfolio/changes', { signedIn: true });

        expect(await screen.findByText('ITR 3T26')).toBeInTheDocument();
        expect(screen.getByText('Resumo indisponível')).toBeInTheDocument();
        expect(screen.getByText('Documento')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver documento de XPLG11' })).toBeInTheDocument();
    });

    it('ignora um documento que não é endereço web', async () => {
        serve(sampleChanges([changeItem({ documentUrl: 'javascript:alert(1)' })]));
        renderRouterAt('/portfolio/changes', { signedIn: true });

        await screen.findByText('XPLG11');

        expect(screen.queryByRole('link', { name: 'Ver documento de XPLG11' })).toBeNull();
    });

    it('troca para 30 dias e pede a janela à API', async () => {
        const user: UserEvent = userEvent.setup();
        const seen: URLSearchParams[] = serve(sampleChanges());
        renderRouterAt('/portfolio/changes', { signedIn: true });
        await screen.findByText('XPLG11');

        await user.click(within(screen.getByRole('radiogroup', { name: 'Período' })).getByRole('radio', { name: '30 dias' }));

        await screen.findByText('XPLG11');
        expect(seen.at(-1)?.get('days')).toBe('30');
    });

    it('sem documentos mostra o vazio e a linha fixa', async () => {
        renderRouterAt('/portfolio/changes', { signedIn: true });

        expect(await screen.findByText('Nenhum documento novo sobre os seus ativos nesta semana.')).toBeInTheDocument();
        expect(screen.getByText(NOTICE)).toBeInTheDocument();
    });

    it('Free vê o cadeado com a contagem e nenhum conteúdo', async () => {
        serveLocked({ feature: 'portfolio_changes', documentCount: 3 });
        renderRouterAt('/portfolio/changes', { signedIn: true });

        const lock: HTMLElement = await screen.findByRole('region', { name: 'O que mudou.' });
        expect(within(lock).getByText(/3 documentos novos sobre os seus ativos nesta semana/)).toBeInTheDocument();
        expect(screen.queryByText('XPLG11')).toBeNull();
    });

    it('Free sem contagem usa o texto geral', async () => {
        serveLocked({ feature: 'portfolio_changes' });
        renderRouterAt('/portfolio/changes', { signedIn: true });

        expect(await screen.findByText(/Com o Premium você vê os documentos novos/)).toBeInTheDocument();
    });

    it('mostra o erro traduzido e tenta de novo', async () => {
        const user: UserEvent = userEvent.setup();
        server.use(http.get('*/portfolio-watch/changes', () => HttpResponse.json(problem('internal', 500), { status: 500 })));
        renderRouterAt('/portfolio/changes', { signedIn: true });
        await screen.findByText('Não foi possível carregar o que mudou.');

        serve(sampleChanges());
        await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));

        expect(await screen.findByText('XPLG11')).toBeInTheDocument();
    });
});
