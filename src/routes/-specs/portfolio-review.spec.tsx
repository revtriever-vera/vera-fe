import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MonthlyReview, MonthlyReviewList } from '@/features/portfolio/review/types';
import { problem } from '../../../test/fixtures/auth';
import { freeBilling } from '../../../test/fixtures/billing';
import { reviewWithoutOperations, sampleReview, sampleReviewList } from '../../../test/fixtures/monthly-review';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const NOTICE: string = 'Isto não é uma recomendação de compra ou venda.';
const PARAGRAPH: string = 'A carteira rendeu 1,42% em outubro, acima do CDI.';

function serve(list: MonthlyReviewList, review: MonthlyReview): string[] {
    const asked: string[] = [];
    server.use(
        http.get('*/portfolio-watch/monthly-reviews', (): Response => HttpResponse.json(list)),
        http.get('*/portfolio-watch/monthly-reviews/:month', ({ params }): Response => {
            asked.push(String(params.month));
            return HttpResponse.json(review);
        })
    );
    return asked;
}

describe('Raio-X do mês: números', () => {
    it('a aba abre o mês mais recente com rentabilidade, indicadores, classes, altas, proventos e concentração', async () => {
        const asked: string[] = serve(sampleReviewList(), sampleReview());
        renderRouterAt('/portfolio/review', { signedIn: true });

        const tabs: HTMLElement = await screen.findByRole('navigation', { name: 'Seções da carteira' });
        expect(within(tabs).getByRole('link', { name: 'Raio-X do mês' })).toHaveAttribute('aria-current', 'page');
        expect(await screen.findByRole('img', { name: 'Sua carteira: +1,42%' })).toBeInTheDocument();
        expect(asked[0]).toBe('2026-10');
        expect(screen.getAllByRole('img', { name: 'CDI: +0,95%' })).toHaveLength(2);
        expect(screen.getAllByText('referente a setembro de 2026')).toHaveLength(2);
        expect(screen.getByText('Rentabilidade com aportes e resgates, pelas suas operações importadas.')).toBeInTheDocument();
        expect(await screen.findByText('Ações Brasil')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Ações Brasil: +3,00%' })).toBeInTheDocument();
        expect(screen.getByText('Falta o fluxo da renda fixa nas operações importadas.')).toBeInTheDocument();
        expect(screen.getByText('XPLG11')).toBeInTheDocument();
        expect(screen.getByText('−6,25%')).toBeInTheDocument();
        expect(screen.getByText('Banco Exemplo')).toBeInTheDocument();
        expect(screen.getByText('Acima do limite do FGC: R$ 1.200,00.')).toBeInTheDocument();
        expect(screen.getByText(NOTICE)).toBeInTheDocument();
    });

    it('Ibovespa sem token aparece como indisponível, sem barra', async () => {
        serve(sampleReviewList(), sampleReview());
        renderRouterAt('/portfolio/review', { signedIn: true });

        expect((await screen.findAllByText('Indisponível: a fonte do índice não está configurada.')).length).toBeGreaterThan(0);
        expect(screen.queryByRole('img', { name: /Ibovespa/ })).not.toBeInTheDocument();
    });

    it('proventos pelo livro dizem que é pela posição na data-com', async () => {
        serve(sampleReviewList(), sampleReview());
        renderRouterAt('/portfolio/review', { signedIn: true });

        expect(await screen.findByText('pela sua posição na data-com')).toBeInTheDocument();
    });

    it('o mês do seletor vem da URL', async () => {
        const asked: string[] = serve(sampleReviewList(), sampleReview({ month: '2026-09' }));
        renderRouterAt('/portfolio/review?month=2026-09', { signedIn: true });

        expect(await screen.findByRole('combobox', { name: 'Mês do Raio-X' })).toHaveTextContent('setembro de 2026');
        expect(asked[0]).toBe('2026-09');
    });
});

describe('Raio-X do mês: sem rentabilidade', () => {
    it('conta sem operações mostra a frase e o link para importar, sem classes', async () => {
        serve(sampleReviewList(), reviewWithoutOperations());
        renderRouterAt('/portfolio/review', { signedIn: true });

        expect(await screen.findByText('A rentabilidade aparece quando as suas operações estiverem importadas.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Importar operações' })).toHaveAttribute('href', '/portfolio/assets');
        expect(screen.queryByText('Por classe')).not.toBeInTheDocument();
        expect(screen.queryByRole('img', { name: /Sua carteira/ })).not.toBeInTheDocument();
    });

    it('sem foto anterior diz a partir de qual mês a rentabilidade aparece', async () => {
        const review: MonthlyReview = sampleReview({
            byClass: [],
            coverage: { reason: 'no_previous_snapshot', message: null, generatedAt: '' }
        });
        serve(sampleReviewList(), { ...review, returnPct: undefined });
        renderRouterAt('/portfolio/review', { signedIn: true });

        expect(await screen.findByText('A rentabilidade aparece a partir de novembro de 2026.')).toBeInTheDocument();
    });

    it('classe que não fecha tira o total e explica', async () => {
        const review: MonthlyReview = sampleReview({ coverage: { reason: 'classes_not_closing', message: null, generatedAt: '' } });
        serve(sampleReviewList(), { ...review, returnPct: undefined });
        renderRouterAt('/portfolio/review', { signedIn: true });

        expect(await screen.findByText(/não aparece porque há classes que não fecham/)).toBeInTheDocument();
        expect(screen.queryByRole('img', { name: /Sua carteira/ })).not.toBeInTheDocument();
    });
});

describe('Raio-X do mês: estados', () => {
    it('sem nenhum Raio-X mostra o estado vazio', async () => {
        renderRouterAt('/portfolio/review', { signedIn: true });

        expect(await screen.findByText('O primeiro Raio-X ainda não saiu')).toBeInTheDocument();
        expect(screen.getByText(NOTICE)).toBeInTheDocument();
    });

    it('falha na lista mostra o erro e deixa tentar de novo', async () => {
        server.use(
            http.get('*/portfolio-watch/monthly-reviews', () => HttpResponse.json(problem('core.internal_error', 500), { status: 500 }))
        );
        renderRouterAt('/portfolio/review', { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar o Raio-X do mês.', undefined, { timeout: 8000 })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    });

    it('mês sem Raio-X (404) avisa em vez de quebrar', async () => {
        server.use(
            http.get('*/portfolio-watch/monthly-reviews', (): Response => HttpResponse.json(sampleReviewList())),
            http.get('*/portfolio-watch/monthly-reviews/:month', () =>
                HttpResponse.json(problem('portfolio_watch.monthly_review_not_found', 404), { status: 404 })
            )
        );
        renderRouterAt('/portfolio/review', { signedIn: true });

        expect(await screen.findByText('Não há Raio-X para este mês.')).toBeInTheDocument();
    });
});

describe('Raio-X do mês: parágrafo', () => {
    it('Premium com parágrafo mostra o texto e o que é enviado', async () => {
        serve(sampleReviewList(), sampleReview({ summary: PARAGRAPH }));
        server.use(http.get('*/ai/payload', () => HttpResponse.json({ kind: 'monthly_review', payload: { month: '2026-10' } })));
        renderRouterAt('/portfolio/review', { signedIn: true });

        expect(await screen.findByText(PARAGRAPH)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ver o que é enviado' })).toBeInTheDocument();
    });

    it('parágrafos separados por linha em branco, número principal em negrito, e o link do payload manda o mês', async () => {
        const text: string = 'A carteira rendeu **+1,42%** em outubro.\n\nO ITUB4 subiu no preço.';
        serve(sampleReviewList(), sampleReview({ summary: text }));
        const queries: URLSearchParams[] = [];
        server.use(
            http.get('*/ai/payload', ({ request }): Response => {
                queries.push(new URL(request.url).searchParams);
                return HttpResponse.json({ kind: 'monthly_review', noticeVersion: 1, payload: { mes: '2026-10' } });
            })
        );
        renderRouterAt('/portfolio/review', { signedIn: true });

        const bold: HTMLElement = await screen.findByText('+1,42%', { selector: 'strong' });
        expect(bold.closest('p')).toHaveTextContent('A carteira rendeu +1,42% em outubro.');
        expect(screen.getByText('O ITUB4 subiu no preço.').closest('p')).not.toBe(bold.closest('p'));
        expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Ver o que é enviado' }));
        await waitFor((): void => {
            expect(queries).toHaveLength(1);
        });
        expect(queries[0]?.get('kind')).toBe('monthly_review');
        expect(queries[0]?.get('month')).toBe('2026-10');
    });

    it('Premium sem parágrafo mostra só os números', async () => {
        serve(sampleReviewList(), sampleReview());
        renderRouterAt('/portfolio/review', { signedIn: true });

        await screen.findByRole('img', { name: 'Sua carteira: +1,42%' });
        expect(screen.queryByRole('button', { name: 'Ver o que é enviado' })).not.toBeInTheDocument();
        expect(screen.queryByText('O mês em palavras')).not.toBeInTheDocument();
    });

    it('Free vê os números completos e o parágrafo com o cadeado do Premium', async () => {
        server.use(http.get('*/billing/me', () => HttpResponse.json(freeBilling())));
        serve(sampleReviewList(), sampleReview());
        renderRouterAt('/portfolio/review', { signedIn: true });

        expect(await screen.findByRole('img', { name: 'Sua carteira: +1,42%' })).toBeInTheDocument();
        const region: HTMLElement = await screen.findByRole('region', { name: /O mês em palavras/ });
        expect(within(region).getByText(/No Premium, a Vera escreve aqui um parágrafo/)).toBeInTheDocument();
    });
});
