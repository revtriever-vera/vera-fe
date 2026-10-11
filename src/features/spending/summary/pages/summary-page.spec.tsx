import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import { closedState } from '../../../../../test/fixtures/onboarding';
import { sessionIdentity } from '../../../../../test/fixtures/auth';
import { CANONICAL_MONTH, CURRENT_MONTH, canonicalSummary, emptySummary } from '../../../../../test/fixtures/spending';
import { server } from '../../../../../test/msw/server';
import { renderRouterAt } from '../../../../../test/router';
import type { MonthlySummary } from '../../types';

interface SummaryApi {
    readonly requests: string[];
    readonly patches: unknown[];
}

function installSummary(build: (month: string | null) => MonthlySummary = (): MonthlySummary => canonicalSummary()): SummaryApi {
    const api: SummaryApi = { requests: [], patches: [] };
    server.use(
        http.get('*/spending/summary', ({ request }): Response => {
            const month: string | null = new URL(request.url).searchParams.get('month');
            api.requests.push(month ?? '');
            return HttpResponse.json(build(month));
        }),
        http.patch('*/spending/categories/:id', async ({ request, params }): Promise<Response> => {
            api.patches.push({ id: params['id'], body: await request.json() });
            return HttpResponse.json({ id: params['id'] });
        })
    );
    return api;
}

async function openSummary(path: string = '/spending'): Promise<AnyRouter> {
    const router: AnyRouter = renderRouterAt(path, { signedIn: true });
    await screen.findByText('Setembro de 2026');
    return router;
}

function trackNamed(name: RegExp): HTMLElement {
    return screen.getByRole('button', { name });
}

describe('resumo do mês: cabeçalho e indicadores', () => {
    it('mostra o mês, a frase e os quatro indicadores do conjunto canônico', async () => {
        installSummary();
        await openSummary();

        expect(screen.getByText('Setembro de 2026')).toBeInTheDocument();
        expect(screen.getByText('Você guardou 12% da renda. Sua meta é 20%.')).toBeInTheDocument();
        const kpis: HTMLElement = screen.getByRole('region', { name: 'Indicadores do mês' });
        expect(within(kpis).getByText('R$ 28.000,00')).toBeInTheDocument();
        expect(within(kpis).getByText('R$ 24.640,00')).toBeInTheDocument();
        expect(within(kpis).getByText('R$ 3.360,00')).toBeInTheDocument();
        expect(within(kpis).getByText('R$ 5.600,00')).toBeInTheDocument();
        expect(within(kpis).getByText('12%')).toBeInTheDocument();
        expect(within(kpis).getByText('20%')).toBeInTheDocument();
        expect(within(kpis).getByText('das transações')).toBeInTheDocument();
    });

    it('o atalho leva a Onde cortar no mesmo mês', async () => {
        installSummary();
        await openSummary();

        expect(screen.getByRole('link', { name: 'Ver onde cortar' })).toHaveAttribute('href', '/spending/cuts?month=2026-09');
    });

    it('os indicadores empilham em uma coluna e abrem em duas ou quatro nas telas maiores', async () => {
        installSummary();
        await openSummary();

        const kpis: HTMLElement = screen.getByRole('region', { name: 'Indicadores do mês' });
        expect(kpis).toHaveClass('grid-cols-1', 'min-[640px]:grid-cols-2', 'lg:grid-cols-4');
    });

    it('guardado negativo diz quanto passou da renda', async () => {
        installSummary(() => canonicalSummary({ savedMinor: -150000, savingsRateBps: -536 }));
        await openSummary();

        expect(screen.getByText('Você gastou R$ 1.500,00 a mais do que ganhou.')).toBeInTheDocument();
    });

    it('sem renda avisa que não há renda registrada', async () => {
        installSummary(() =>
            canonicalSummary({
                income: { minor: 0, mode: 'declared', fromTransactionsMinor: 0 },
                savingsRateBps: null,
                fixedShareBps: null
            })
        );
        await openSummary();

        expect(screen.getByText('Sem renda registrada neste mês.')).toBeInTheDocument();
        expect(screen.getByText('Gastos fixos somam R$ 12.300,00. O resto é onde dá pra mexer.')).toBeInTheDocument();
        expect(screen.getByText('valor fixo')).toBeInTheDocument();
    });
});

describe('resumo do mês: barras', () => {
    it('ordena por valor, como a API manda', async () => {
        installSummary();
        await openSummary();

        const order: string[] = screen
            .getAllByRole('button', { name: /^[^:]+: R\$\s[\d.]+,\d{2}/ })
            .map((track: HTMLElement): string => (track.getAttribute('aria-label') ?? '').split(':')[0] ?? '');
        expect(order).toEqual([
            'Moradia',
            'Educação',
            'Mercado',
            'Delivery e restaurantes',
            'Compras',
            'Lazer',
            'Saúde',
            'Transporte',
            'Assinaturas',
            'Sem categoria'
        ]);
    });

    it('destaca Delivery, Compras e Lazer e deixa Mercado sem selo', async () => {
        installSummary();
        await openSummary();

        expect(screen.getByText('+40% vs média')).toBeInTheDocument();
        expect(screen.getByText('+47% vs média')).toBeInTheDocument();
        expect(screen.getByText('+36% vs média')).toBeInTheDocument();
        expect(screen.getAllByText(/vs média$/)).toHaveLength(3);
        expect(screen.queryByText('+9% vs média')).not.toBeInTheDocument();
    });

    it('marca categoria nova com o selo novo, sem selo de variação', async () => {
        installSummary(() => {
            const summary: MonthlySummary = canonicalSummary();
            const [first, ...others] = summary.categories;
            return {
                ...summary,
                categories: [
                    { ...(first as (typeof summary.categories)[number]), isNew: true, averageMinor: null, deltaBps: null },
                    ...others
                ]
            };
        });
        await openSummary();

        expect(screen.getByText('novo')).toBeInTheDocument();
        expect(screen.getAllByText(/vs média$/)).toHaveLength(3);
    });

    it('mostra a linha Sem categoria com o atalho para as transações filtradas', async () => {
        installSummary();
        await openSummary();

        const link: HTMLElement = screen.getByRole('link', { name: 'categorizar' });
        expect(link).toHaveAttribute('href', '/spending/transactions?month=2026-09&uncategorized=true');
        expect(screen.getAllByText('R$ 800,00').length).toBeGreaterThan(0);
    });

    it('sem gasto sem categoria a linha some', async () => {
        installSummary(() => canonicalSummary({ uncategorizedMinor: 0, uncategorizedCount: 0 }));
        await openSummary();

        expect(screen.queryByRole('link', { name: 'categorizar' })).not.toBeInTheDocument();
    });

    it('mostra a legenda e a nota dos fixos', async () => {
        installSummary();
        await openSummary();

        const legend: HTMLElement = screen.getByRole('list', { name: 'Legenda do gráfico' });
        expect(
            within(legend)
                .getAllByRole('listitem')
                .map((item: HTMLElement): string => item.textContent ?? '')
        ).toEqual(['flexível', 'fixo', 'sem categoria', 'média']);
        expect(screen.getByText('Gastos fixos somam R$ 12.300,00 (44% da renda). O resto é onde dá pra mexer.')).toBeInTheDocument();
        expect(screen.getByText(/A marca escura é a sua média dos últimos 3 meses/)).toBeInTheDocument();
    });
});

describe('resumo do mês: notas', () => {
    it('mostra as transferências fora da conta', async () => {
        installSummary();
        await openSummary();

        expect(
            screen.getByText('R$ 12.000,00 em transferências entre suas contas, pagamento de fatura e investimentos não entram como gasto.')
        ).toBeInTheDocument();
    });

    it('avisa das transações em outra moeda, no singular e no plural', async () => {
        installSummary(() => canonicalSummary({ excludedCurrencyCount: 1 }));
        await openSummary();
        expect(screen.getByText('1 transação em outra moeda ficou de fora do resumo.')).toBeInTheDocument();
    });

    it('avisa das transações em outra moeda no plural', async () => {
        installSummary(() => canonicalSummary({ excludedCurrencyCount: 3 }));
        await openSummary();
        expect(screen.getByText('3 transações em outra moeda ficaram de fora do resumo.')).toBeInTheDocument();
    });

    it('avisa das entradas sem categoria', async () => {
        installSummary(() => canonicalSummary({ uncategorizedInflowMinor: 45000 }));
        await openSummary();

        expect(
            screen.getByText('R$ 450,00 em entradas sem categoria não contam como renda. Categorize em Transações.')
        ).toBeInTheDocument();
    });

    it('sem nada a avisar não mostra as notas opcionais', async () => {
        installSummary(() => canonicalSummary({ transfersOutMinor: 0 }));
        await openSummary();

        expect(screen.queryByText(/em transferências entre suas contas/)).not.toBeInTheDocument();
        expect(screen.queryByText(/em outra moeda/)).not.toBeInTheDocument();
        expect(screen.queryByText(/em entradas sem categoria/)).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('o mês corrente mostra o selo de parcial e a nota', async () => {
        installSummary((month: string | null) =>
            canonicalSummary({ month: month ?? CURRENT_MONTH, isPartial: true, previousMonth: CANONICAL_MONTH, nextMonth: null })
        );
        renderRouterAt(`/spending?month=${CURRENT_MONTH}`, { signedIn: true });

        expect(await screen.findByText('Outubro de 2026')).toBeInTheDocument();
        expect(screen.getByText('mês em andamento')).toBeInTheDocument();
        expect(screen.getByText('Os números mudam até o mês fechar')).toBeInTheDocument();
    });
});

describe('resumo do mês: interações', () => {
    it('o tooltip abre por foco e mostra a média e o número de transações', async () => {
        installSummary();
        await openSummary();

        act(() => {
            trackNamed(/^Delivery e restaurantes:/).focus();
        });

        const tip: HTMLElement = (await screen.findAllByRole('tooltip'))[0] as HTMLElement;
        expect(within(tip).getByText('Gasto no mês: R$ 2.450,00')).toBeInTheDocument();
        expect(within(tip).getByText('Média: R$ 1.750,00')).toBeInTheDocument();
        expect(within(tip).getByText('Variação: +40%')).toBeInTheDocument();
        expect(within(tip).getByText('3 transações')).toBeInTheDocument();
        expect(within(tip).getByRole('link', { name: 'ver transações' })).toHaveAttribute(
            'href',
            '/spending/transactions?month=2026-09&categoryId=cat-eating-out'
        );
    });

    it('com menos de três meses de histórico o tooltip diz de quantos meses é a média', async () => {
        installSummary(() => canonicalSummary({ averageMonths: 2 }));
        await openSummary();

        act(() => {
            trackNamed(/^Mercado:/).focus();
        });

        expect(await screen.findByText('média de 2 meses')).toBeInTheDocument();
    });

    it('sem média o tooltip diz que ainda não há média', async () => {
        installSummary(() => {
            const summary: MonthlySummary = canonicalSummary();
            return {
                ...summary,
                categories: summary.categories.map((row) => ({ ...row, averageMinor: null, deltaBps: null, isNew: true }))
            };
        });
        await openSummary();

        act(() => {
            trackNamed(/^Mercado:/).focus();
        });

        expect(await screen.findByText('Sem média ainda')).toBeInTheDocument();
    });

    it('o toque na linha sem categoria abre o tooltip com o atalho', async () => {
        installSummary();
        const user: UserEvent = userEvent.setup();
        await openSummary();

        await user.click(trackNamed(/^Sem categoria:/));

        const tip: HTMLElement = (await screen.findAllByRole('tooltip'))[0] as HTMLElement;
        expect(within(tip).getByText('2 transações')).toBeInTheDocument();
        expect(within(tip).getByRole('link', { name: 'categorizar' })).toHaveAttribute(
            'href',
            '/spending/transactions?month=2026-09&uncategorized=true'
        );
    });

    it('alternar o interruptor de Mercado chama o PATCH e recarrega o resumo', async () => {
        const api: SummaryApi = installSummary();
        const user: UserEvent = userEvent.setup();
        await openSummary();
        const before: number = api.requests.length;

        await user.click(screen.getByRole('button', { name: 'Natureza de Mercado: flexível' }));

        await waitFor(() => {
            expect(api.patches).toEqual([{ id: 'cat-groceries', body: { flexibility: 'fixed' } }]);
        });
        await waitFor(() => {
            expect(api.requests.length).toBeGreaterThan(before);
        });
    });

    it('o seletor de mês vai ao mês anterior e atualiza a URL e a requisição', async () => {
        const api: SummaryApi = installSummary((month: string | null) =>
            month === '2026-08'
                ? canonicalSummary({ month: '2026-08', previousMonth: '2026-07', nextMonth: CANONICAL_MONTH })
                : canonicalSummary()
        );
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = await openSummary();

        await user.click(screen.getByRole('button', { name: 'Mês anterior' }));

        expect(await screen.findByText('Agosto de 2026')).toBeInTheDocument();
        expect(router.state.location.search).toEqual({ month: '2026-08' });
        expect(api.requests).toContain('2026-08');
    });

    it('o link alterar abre o diálogo da origem da renda', async () => {
        installSummary();
        const user: UserEvent = userEvent.setup();
        await openSummary();

        await user.click(screen.getByRole('button', { name: 'Alterar a origem da renda' }));

        expect(await screen.findByText('De onde vem a sua renda')).toBeInTheDocument();
    });
});

describe('resumo do mês: estados', () => {
    it('sem dados mostra o estado vazio com as três ações', async () => {
        installSummary(() => emptySummary(CURRENT_MONTH));
        server.use(
            http.get('*/onboarding', (): Response => HttpResponse.json(closedState({ sample: { active: false, available: true } })))
        );
        renderRouterAt('/spending', { signedIn: true });

        expect(await screen.findByRole('heading', { name: 'Nenhum gasto por aqui ainda' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Conectar bancos' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Importar extrato' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Explorar com dados de exemplo' })).toBeInTheDocument();
    });

    it('renda zerada no modo transações mostra o alerta e o botão abre o diálogo', async () => {
        installSummary(() =>
            canonicalSummary({
                income: { minor: 0, mode: 'transactions', fromTransactionsMinor: 0 },
                savingsRateBps: null,
                fixedShareBps: null
            })
        );
        const user: UserEvent = userEvent.setup();
        await openSummary();

        const alert: HTMLElement = screen.getByRole('alert');
        expect(alert).toHaveTextContent(
            'Não encontramos sua renda neste mês. Se o salário cai num banco que não está conectado, informe um valor fixo.'
        );
        await user.click(within(alert).getByRole('button', { name: 'Informar renda' }));

        expect(await screen.findByText('De onde vem a sua renda')).toBeInTheDocument();
    });

    it('mostra o esqueleto enquanto carrega', async () => {
        installSummary();
        renderRouterAt('/spending', { signedIn: true });

        expect(await screen.findByRole('status')).toHaveTextContent('Carregando o resumo do mês');
        await screen.findByText('Setembro de 2026');
    });

    it('erro mostra o alerta e tenta de novo', async () => {
        let failures: number = 1;
        server.use(
            http.get('*/spending/summary', (): Response => {
                if (failures > 0) {
                    failures -= 1;
                    return HttpResponse.json(
                        { type: 'internal', title: 'x', status: 500, detail: 'falhou', requestId: 'req-123' },
                        { status: 500 }
                    );
                }
                return HttpResponse.json(canonicalSummary());
            })
        );
        renderRouterAt('/spending', { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar o resumo do mês.')).toBeInTheDocument();
        await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar de novo' }));

        expect(await screen.findByText('Setembro de 2026')).toBeInTheDocument();
    });
});

describe('resumo do mês: acessibilidade', () => {
    it('a lista em texto traz o mesmo conteúdo das barras para o leitor de tela', async () => {
        installSummary();
        await openSummary();

        const list: HTMLElement = screen.getByRole('list', { name: 'Gastos por categoria, em texto' });
        expect(list).toHaveClass('sr-only');
        const items: HTMLElement[] = within(list).getAllByRole('listitem');
        expect(items).toHaveLength(10);
        expect(items[3]).toHaveTextContent('Delivery e restaurantes (flexível): R$ 2.450,00, média de R$ 1.750,00, variação de +40%.');
        expect(items[9]).toHaveTextContent('Sem categoria: R$ 800,00.');
        expect(within(items[0] as HTMLElement).getByRole('link')).toHaveAttribute(
            'href',
            '/spending/transactions?month=2026-09&categoryId=cat-housing'
        );
    });

    it('a lista em texto cobre categoria nova e categoria sem média', async () => {
        installSummary(() => {
            const summary: MonthlySummary = canonicalSummary();
            const [first, second, ...others] = summary.categories;
            return {
                ...summary,
                categories: [
                    { ...(first as (typeof summary.categories)[number]), isNew: true, averageMinor: null, deltaBps: null },
                    { ...(second as (typeof summary.categories)[number]), isNew: false, averageMinor: null, deltaBps: null },
                    ...others
                ]
            };
        });
        await openSummary();

        const items: HTMLElement[] = within(screen.getByRole('list', { name: 'Gastos por categoria, em texto' })).getAllByRole('listitem');
        expect(items[0]).toHaveTextContent('Moradia (fixo): R$ 7.700,00, categoria nova, sem média.');
        expect(items[1]).toHaveTextContent('Educação (fixo): R$ 3.200,00.');
    });

    it('o interruptor de fixo e flexível tem texto e estado', async () => {
        installSummary();
        await openSummary();

        const toggle: HTMLElement = screen.getByRole('button', { name: 'Natureza de Moradia: fixo' });
        expect(toggle).toHaveTextContent('fixo');
        expect(toggle).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByRole('button', { name: 'Natureza de Mercado: flexível' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('as marcas da barra são decorativas e a trilha tem nome', async () => {
        installSummary();
        await openSummary();

        const track: HTMLElement = trackNamed(/^Moradia:/);
        expect(track.getAttribute('aria-label')).toMatch(/^Moradia: R\$\s7\.700,00, média de R\$\s7\.700,00$/);
        expect(Array.from(track.children).every((child: Element): boolean => child.getAttribute('aria-hidden') === 'true')).toBe(true);
    });
});

describe('resumo do mês: inglês', () => {
    it('traduz os textos e formata a moeda pelo locale', async () => {
        installSummary();
        renderRouterAt('/spending', { signedIn: true });
        server.use(http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ locale: 'en' }))));

        expect(await screen.findByText('September 2026')).toBeInTheDocument();
        expect(screen.getByText('You saved 12% of your income. Your goal is 20%.')).toBeInTheDocument();
        const kpis: HTMLElement = screen.getByRole('region', { name: 'Month indicators' });
        expect(within(kpis).getByText('R$28,000.00')).toBeInTheDocument();
        expect(screen.getByText('+40% vs average')).toBeInTheDocument();
        expect(screen.getByText('Where the money went')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'See where to cut' })).toBeInTheDocument();
    });
});
