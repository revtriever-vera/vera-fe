import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import { track } from '@/shared/lib/analytics';
import { i18n } from '@/shared/lib/i18n';
import type { CutsResponse } from '@/features/spending/types';
import { sessionIdentity } from '../../../../../test/fixtures/auth';
import { emptyCuts, canonicalCuts } from '../../../../../test/fixtures/spending';
import { installCutsApi, noIncomeCuts, type CutsApi } from '../../../../../test/helpers/cuts-api';
import { server } from '../../../../../test/msw/server';
import { renderRouterAt } from '../../../../../test/router';

vi.mock('@/shared/lib/analytics', () => ({ track: vi.fn() }));

const PATH: string = '/spending/cuts?month=2026-09';
const SPACES: RegExp = /\s/g;

function stubNarrow(narrow: boolean): void {
    window.matchMedia = (query: string): MediaQueryList =>
        ({
            matches: narrow,
            media: query,
            addEventListener: (): void => undefined,
            removeEventListener: (): void => undefined
        }) as unknown as MediaQueryList;
}

function viewedCalls(): unknown[][] {
    return vi.mocked(track).mock.calls.filter((call: unknown[]): boolean => call[0] === 'spending_cuts_viewed');
}

function text(element: HTMLElement | null): string {
    return (element?.textContent ?? '').replace(SPACES, ' ');
}

async function openPage(path: string = PATH): Promise<{ user: UserEvent; router: AnyRouter }> {
    const user: UserEvent = userEvent.setup();
    const router: AnyRouter = renderRouterAt(path, { signedIn: true });
    await screen.findByRole('slider', { name: 'Meta de economia' });
    return { user, router };
}

function slideTo(percent: number): HTMLElement {
    const slider: HTMLElement = screen.getByRole('slider', { name: 'Meta de economia' });
    fireEvent.change(slider, { target: { value: String(percent) } });
    return slider;
}

beforeEach(() => {
    vi.mocked(track).mockClear();
});

afterEach(async () => {
    Reflect.deleteProperty(window, 'matchMedia');
    await i18n.changeLanguage('pt-BR');
});

describe('CutsPage: meta de 20%', () => {
    it('mostra o que falta, a frase e a tabela em ordem, sem mandar goalBps', async () => {
        const api: CutsApi = installCutsApi();
        await openPage();

        expect(await screen.findByText('Falta por mês')).toBeInTheDocument();
        expect(text(screen.getByText('R$ 2.240', { selector: 'span.numeric' }))).toBe('R$ 2.240');
        expect(
            screen.getByText('Dá pra chegar lá cortando R$ 2.240 em 6 categorias flexíveis.', {
                normalizer: (value: string) => value.replace(SPACES, ' ')
            })
        ).toBeInTheDocument();
        const table: HTMLElement = screen.getByRole('table', { name: 'Sugestão de limites por categoria' });
        const rows: HTMLElement[] = within(table).getAllByRole('row');
        expect(text(rows[1] ?? null)).toContain('Compras');
        expect(text(rows[1] ?? null)).toContain('−R$ 721');
        expect(text(rows[1] ?? null)).toContain('R$ 1.629');
        expect(text(rows[6] ?? null)).toContain('Assinaturas');
        expect(text(rows[6] ?? null)).toContain('−R$ 29');
        expect(api.requests.every((query: URLSearchParams): boolean => !query.has('goalBps'))).toBe(true);
    });

    it('mostra o título com o mês seguinte, o apoio e os cabeçalhos', async () => {
        installCutsApi();
        await openPage();

        expect(await screen.findByRole('heading', { name: 'Sugestão de limites para outubro de 2026' })).toBeInTheDocument();
        expect(screen.getByText('Começa pelo que subiu acima da sua média; só passa disso se ainda faltar.')).toBeInTheDocument();
        const headers: string[] = screen.getAllByRole('columnheader').map((cell: HTMLElement): string => cell.textContent ?? '');
        expect(headers).toEqual(['Categoria', 'Setembro de 2026', 'Sua média', 'Cortar', 'Limite sugerido']);
    });

    it('mostra as pílulas de meta e de guardado', async () => {
        installCutsApi();
        await openPage();

        expect(text(await screen.findByText(/^Meta R\$/))).toBe('Meta R$ 5.600');
        expect(text(screen.getByText(/^Guardado/))).toBe('Guardado R$ 3.360 (12%)');
    });

    it('avisa o que ficou sem categoria e leva à lista filtrada', async () => {
        installCutsApi();
        const { router } = await openPage();

        expect(text(await screen.findByText(/sem categoria ficaram de fora da conta/))).toBe(
            'R$ 800 sem categoria ficaram de fora da conta.'
        );
        const link: HTMLElement = screen.getByRole('link', { name: 'Categorizar' });
        expect(link).toHaveAttribute('href', '/spending/transactions?month=2026-09&uncategorized=true');
        expect(router.state.location.pathname).toBe('/spending/cuts');
    });

    it('sem valor sem categoria, não mostra o aviso', async () => {
        installCutsApi({ override: { ...canonicalCuts('goal20'), uncategorizedMinor: 0 } });
        await openPage();

        await screen.findByText('Falta por mês');
        expect(screen.queryByRole('link', { name: 'Categorizar' })).not.toBeInTheDocument();
    });

    it('mês em andamento mostra a nota de que os números podem mudar', async () => {
        installCutsApi({ override: { ...canonicalCuts('goal20'), isPartial: true } });
        await openPage();

        expect(await screen.findByText('O mês ainda não fechou; os números podem mudar.')).toBeInTheDocument();
    });

    it('média de menos de três meses diz de quantos meses e corte pequeno vira traço', async () => {
        const base: CutsResponse = canonicalCuts('goal20');
        const [first, ...rest] = base.suggestions;
        installCutsApi({
            override: {
                ...base,
                averageMonths: 2,
                suggestions: [{ ...(first as (typeof base.suggestions)[number]), cutMinor: 50, averageMinor: null }, ...rest]
            }
        });
        await openPage();

        expect(await screen.findAllByText('média de 2 meses')).not.toHaveLength(0);
        const table: HTMLElement = screen.getByRole('table', { name: 'Sugestão de limites por categoria' });
        const firstRow: HTMLElement = within(table).getAllByRole('row')[1] as HTMLElement;
        expect(text(firstRow)).not.toContain('−R$');
        expect(within(firstRow).getAllByText('—')).toHaveLength(2);
    });

    it('envia spending_cuts_viewed uma vez, com o status', async () => {
        installCutsApi();
        await openPage();
        await screen.findByText('Falta por mês');

        expect(viewedCalls()).toEqual([['spending_cuts_viewed', { status: 'cut_suggested' }]]);
    });
});

describe('CutsPage: slider', () => {
    it('arrastar para 35% faz uma chamada com goalBps=3500 depois do debounce', async () => {
        const api: CutsApi = installCutsApi();
        await openPage();
        await screen.findByText('Falta por mês');
        const before: number = api.requests.length;

        slideTo(30);
        slideTo(35);
        expect(api.requests).toHaveLength(before);

        await waitFor(() => {
            expect(api.requests).toHaveLength(before + 1);
        });
        expect(api.requests.at(-1)?.get('goalBps')).toBe('3500');
        expect(await screen.findByText('R$ 6.440', { selector: 'span.numeric' })).toBeInTheDocument();
        const table: HTMLElement = screen.getByRole('table', { name: 'Sugestão de limites por categoria' });
        expect(text(within(table).getAllByRole('row')[1] ?? null)).toContain('−R$ 1.587');
        expect(viewedCalls()).toHaveLength(1);
    });

    it('expõe valor e texto de valor, com limites e passo de 1 ponto para as setas', async () => {
        installCutsApi();
        await openPage();

        const slider: HTMLElement = screen.getByRole('slider', { name: 'Meta de economia' });
        expect(slider).toHaveValue('20');
        expect(slider).toHaveAttribute('aria-valuetext', '20% da renda');
        expect(slider).toHaveAttribute('min', '5');
        expect(slider).toHaveAttribute('max', '60');
        expect(slider).toHaveAttribute('step', '1');
        slider.focus();
        expect(slider).toHaveFocus();
        slideTo(21);
        expect(screen.getByRole('slider', { name: 'Meta de economia' })).toHaveAttribute('aria-valuetext', '21% da renda');
    });

    it('o botão Salvar meta só aparece com a meta alterada e grava com PUT', async () => {
        const api: CutsApi = installCutsApi();
        const { user } = await openPage();
        await screen.findByText('Falta por mês');
        expect(screen.queryByRole('button', { name: 'Salvar meta' })).not.toBeInTheDocument();

        slideTo(35);
        await user.click(await screen.findByRole('button', { name: 'Salvar meta' }));

        await waitFor(() => {
            expect(api.puts).toEqual([{ savingsGoalBps: 3500 }]);
        });
        expect(await screen.findByText('Meta salva')).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('spending_goal_saved');
        await waitFor(() => {
            expect(screen.queryByRole('button', { name: 'Salvar meta' })).not.toBeInTheDocument();
        });
        expect(screen.getByRole('slider', { name: 'Meta de economia' })).toHaveValue('35');
    });

    it('falha ao salvar mostra o erro e mantém o rascunho', async () => {
        installCutsApi();
        server.use(
            http.put('*/spending/settings', () =>
                HttpResponse.json({ type: 'validation_failed', title: 'x', status: 422, detail: 'd', requestId: null }, { status: 422 })
            )
        );
        const { user } = await openPage();
        await screen.findByText('Falta por mês');

        slideTo(35);
        await user.click(await screen.findByRole('button', { name: 'Salvar meta' }));

        expect(await screen.findByText('Confira os dados informados e tente de novo.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Salvar meta' })).toBeInTheDocument();
        expect(track).not.toHaveBeenCalledWith('spending_goal_saved');
    });

    it('sair com a meta alterada pede confirmação', async () => {
        installCutsApi();
        const { user, router } = await openPage();
        await screen.findByText('Falta por mês');
        slideTo(35);

        await user.click(screen.getByRole('link', { name: 'Regras' }));

        expect(await screen.findByText('Sair sem salvar a meta?')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/spending/cuts');
        await user.click(screen.getByRole('button', { name: 'Continuar editando' }));
        expect(screen.queryByText('Sair sem salvar a meta?')).not.toBeInTheDocument();

        await user.click(screen.getByRole('link', { name: 'Regras' }));
        await user.click(await screen.findByRole('button', { name: 'Sair sem salvar' }));
        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/spending/rules');
        });
    });

    it('sem alteração, sai sem perguntar', async () => {
        installCutsApi();
        const { user, router } = await openPage();
        await screen.findByText('Falta por mês');

        await user.click(screen.getByRole('link', { name: 'Regras' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/spending/rules');
        });
        expect(screen.queryByText('Sair sem salvar a meta?')).not.toBeInTheDocument();
    });
});

describe('CutsPage: status', () => {
    it('meta de 60%: passa do total flexível e mostra os limites zerados', async () => {
        installCutsApi({ savedBps: 6000 });
        await openPage();

        expect(
            await screen.findByText(
                'Mais do que todos os gastos flexíveis somados. Para essa meta, seria preciso rever algum gasto fixo ou a renda.'
            )
        ).toBeInTheDocument();
        const table: HTMLElement = screen.getByRole('table', { name: 'Sugestão de limites por categoria' });
        const rows: HTMLElement[] = within(table).getAllByRole('row').slice(1);
        expect(rows.every((row: HTMLElement): boolean => text(row).trimEnd().endsWith('R$ 0'))).toBe(true);
    });

    it('meta de 10%: meta atingida com o excedente e o atalho para o aporte', async () => {
        installCutsApi({ savedBps: 1000 });
        const { user } = await openPage();

        expect(await screen.findByText('Meta atingida')).toBeInTheDocument();
        expect(screen.getByText('R$ 560', { selector: 'span.numeric.text-3xl' })).toBeInTheDocument();
        expect(
            screen.getByText('Você guardou mais do que a meta. Esse valor pode ir direto para o aporte inteligente.')
        ).toBeInTheDocument();
        const link: HTMLElement = screen.getByRole('link', { name: 'Ir para o aporte inteligente' });
        expect(link).toHaveAttribute('href', '/portfolio/contribution?amount=560');
        await user.click(link);
        expect(track).toHaveBeenCalledWith('spending_contribution_shortcut');
    });

    it('sem renda: mostra o texto e o botão abre o diálogo da origem da renda', async () => {
        installCutsApi({ override: noIncomeCuts() });
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Sem renda registrada neste mês, não dá para calcular a meta.')).toBeInTheDocument();
        expect(screen.queryByRole('slider')).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Definir a renda' }));

        expect(await screen.findByRole('radiogroup', { name: 'Origem da renda' })).toBeInTheDocument();
    });

    it('sem dados: mostra o estado vazio', async () => {
        installCutsApi({ override: emptyCuts('2026-09') });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByRole('heading', { name: 'Nenhum gasto por aqui ainda' })).toBeInTheDocument();
        expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    });

    it('falha ao carregar mostra o alerta', async () => {
        installCutsApi();
        server.use(
            http.get('*/spending/cuts', () =>
                HttpResponse.json({ type: 'x', title: 'x', status: 500, detail: 'detalhe técnico', requestId: null }, { status: 500 })
            )
        );
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar a sugestão de cortes')).toBeInTheDocument();
    });
});

describe('CutsPage: idioma e largura', () => {
    it('em inglês, traduz a tela e usa o formato da moeda', async () => {
        installCutsApi();
        renderRouterAt(PATH, { signedIn: true });
        server.use(http.get('*/auth/me', () => HttpResponse.json(sessionIdentity({ locale: 'en' }))));

        expect(await screen.findByText('Missing per month')).toBeInTheDocument();
        expect(screen.getByRole('slider', { name: 'Savings goal' })).toHaveAttribute('aria-valuetext', '20% of income');
        expect(screen.getByText('You can get there by cutting R$2,240 in 6 flexible categories.')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Suggested limits for October 2026' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Categorize' })).toBeInTheDocument();
    });

    it('em 390 px, vira lista de cartões sem tabela', async () => {
        stubNarrow(true);
        installCutsApi();
        await openPage();

        const list: HTMLElement = await screen.findByRole('list', { name: 'Limites sugeridos' });
        expect(within(list).getAllByRole('listitem')).toHaveLength(6);
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
        expect(text(within(list).getAllByRole('listitem')[0] ?? null)).toContain('−R$ 721');
    });
});
