import { track } from '@/shared/lib/analytics';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { AnyRouter } from '@tanstack/react-router';
import { contributionAsset, contributionClass, sampleSuggestion } from '../../../test/fixtures/contribution';
import { sessionIdentity } from '../../../test/fixtures/auth';
import { installContributionApi, type ContributionApi } from '../../../test/helpers/contribution-api';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const PATH: string = '/portfolio/contribution?amount=10000';

function openScreen(path: string = PATH): { api: ContributionApi; user: UserEvent; router: AnyRouter } {
    const api: ContributionApi = installContributionApi();
    const router: AnyRouter = renderRouterAt(path, { signedIn: true });
    return { api, user: userEvent.setup(), router };
}

function cards(): HTMLElement[] {
    return within(screen.getByRole('list', { name: 'Sugestão por classe' }))
        .getAllByRole('listitem')
        .filter((item: HTMLElement): boolean => item.classList.contains('surface-card'));
}

describe('aporte: sugestão', () => {
    it('mostra os quatro cartões na ordem da API, com antes → depois', async () => {
        openScreen();

        await screen.findByText('Renda fixa IPCA+');
        const shown: HTMLElement[] = cards();
        expect(shown).toHaveLength(4);
        const expected: readonly (readonly string[])[] = [
            ['Renda fixa IPCA+', 'R$ 3.940,46', '7,3% → 7,5% (meta 12%)'],
            ['Ações EUA', 'R$ 3.475,96', '20,9% → 21,0% (meta 25%)'],
            ['Ações Brasil', 'R$ 2.193,25', '12,4% → 12,5% (meta 15%)'],
            ['FIIs', 'R$ 390,33', '6,6% → 6,6% (meta 7%)']
        ];
        expect(track).toHaveBeenCalledWith('portfolio_contribution_calculated', { classesFunded: 4, currency: 'BRL' });
        expected.forEach((texts: readonly string[], index: number): void => {
            texts.forEach((text: string): void => {
                expect(shown[index]).toHaveTextContent(text);
            });
        });
    });

    it('mostra as cotas aproximadas por ativo', async () => {
        openScreen();

        const brazil: HTMLElement = (await screen.findByText('Ações Brasil')).closest('li') as HTMLElement;
        expect(within(brazil).getByText('WEGE3').closest('li')).toHaveTextContent('R$ 2.136,07≈ 40 cotas');
        expect(within(brazil).getByText('PETR4').closest('li')).toHaveTextContent('R$ 57,18≈ 1 cota');
        expect(within(brazil).queryByText('ITUB4')).not.toBeInTheDocument();
        expect(screen.getByText('≈ 0,612345 cota')).toBeInTheDocument();
        expect(screen.getByText('menos de 1 cota')).toBeInTheDocument();
        expect(screen.getByText('novo título ou reforço')).toBeInTheDocument();
    });

    it('mostra a nota da conta com o patrimônio da API e o aviso de que não é recomendação', async () => {
        openScreen();

        expect(await screen.findByText(/o patrimônio vai a R\$ 1\.783\.100,40/)).toBeInTheDocument();
        expect(screen.getByText(/Não é recomendação de investimento\./)).toBeInTheDocument();
        expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Sugestão atualizada para R$ 10.000,00');
    });

    it('sem URL abre com 10.000 e grava o valor na URL', async () => {
        const { api, router } = openScreen('/portfolio/contribution');

        expect(await screen.findByRole('textbox', { name: 'Quanto você vai aportar (R$)' })).toHaveValue('10.000,00');
        await waitFor(() => {
            expect(router.state.location.search).toEqual({ amount: 10000 });
        });
        expect(api.amounts).toEqual([1000000]);
    });
});

describe('aporte: valor', () => {
    it('digitar 25.000 atualiza a URL e refaz a chamada uma vez depois do debounce', async () => {
        const { api, user, router } = openScreen();
        const input: HTMLElement = await screen.findByRole('textbox', { name: 'Quanto você vai aportar (R$)' });
        await screen.findByText('Ações Brasil');

        await user.clear(input);
        await user.type(input, '25000');

        await waitFor(() => {
            expect(router.state.location.search).toEqual({ amount: 25000 });
        });
        await waitFor(() => {
            expect(api.amounts).toEqual([1000000, 2500000]);
        });
        expect(await screen.findByRole('status')).toHaveTextContent('Sugestão atualizada para R$ 25.000,00');
    });

    it('o atalho R$ 5.000 troca o valor', async () => {
        const { api, user, router } = openScreen();
        await screen.findByText('Ações Brasil');

        await user.click(screen.getByRole('button', { name: /^R\$\s5\.000$/ }));

        await waitFor(() => {
            expect(router.state.location.search).toEqual({ amount: 5000 });
        });
        await waitFor(() => {
            expect(api.amounts).toEqual([1000000, 500000]);
        });
        expect(screen.getByRole('button', { name: /^R\$\s5\.000$/ })).toHaveAttribute('aria-pressed', 'true');
    });

    it('valor vazio mostra a dica e não chama a API', async () => {
        const { api, user, router } = openScreen();
        const input: HTMLElement = await screen.findByRole('textbox', { name: 'Quanto você vai aportar (R$)' });
        await screen.findByText('Ações Brasil');

        await user.clear(input);

        expect(await screen.findByText('Informe um valor para ver a sugestão.')).toBeInTheDocument();
        expect(api.amounts).toEqual([1000000]);
        expect(router.state.location.search).toEqual({ amount: 0 });
    });

    it('amount=0 na URL abre vazio', async () => {
        const { api } = openScreen('/portfolio/contribution?amount=0');

        expect(await screen.findByText('Informe um valor para ver a sugestão.')).toBeInTheDocument();
        expect(api.amounts).toEqual([]);
    });
});

describe('aporte: moeda base', () => {
    it('trocar para USD refaz a conta e muda os atalhos', async () => {
        const { api, user } = openScreen();
        await screen.findByText('Ações Brasil');
        expect(screen.getByRole('button', { name: /^R\$\s50\.000$/ })).toBeInTheDocument();

        await user.click(screen.getByRole('radio', { name: /US\$/ }));

        expect(await screen.findByRole('button', { name: /^US\$\s1\.000$/ })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^R\$\s50\.000$/ })).not.toBeInTheDocument();
        await waitFor(() => {
            expect(api.amounts).toEqual([1000000, 1000000]);
        });
        expect(await screen.findByRole('textbox', { name: 'Quanto você vai aportar (US$)' })).toBeInTheDocument();
    });
});

describe('aporte: avisos e estados', () => {
    it('422 de metas não definidas mostra o estado vazio com o link', async () => {
        installContributionApi({ failure: { type: 'contribution.targets_not_set', status: 422 } });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Defina sua carteira-alvo primeiro')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Definir carteira-alvo' })).toHaveAttribute('href', '/portfolio/targets');
    });

    it('metas que não somam 100% mostram o alerta', async () => {
        installContributionApi({ suggestion: sampleSuggestion({ warnings: ['class_targets_not_100'] }) });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('As metas das classes não somam 100%')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ajustar metas' })).toHaveAttribute('href', '/portfolio/targets');
    });

    it('classe sem ativos mostra a orientação e o link; ativo sem preço mostra o aviso', async () => {
        installContributionApi({
            suggestion: sampleSuggestion({
                classes: [
                    contributionClass({ classId: 'class-cripto', systemKey: 'cripto', colorKey: 'c8', note: 'no_assets', assets: [] }),
                    contributionClass({
                        assets: [
                            {
                                ...contributionAsset(),
                                approxUnits: null
                            }
                        ]
                    })
                ]
            })
        });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText(/Nenhum ativo nesta classe\./)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver a classe Cripto' })).toHaveAttribute('href', '/portfolio/classes/class-cripto');
        expect(screen.getByText('preço indisponível')).toBeInTheDocument();
    });

    it('carteira sem ativos manda cadastrar', async () => {
        installContributionApi({
            suggestion: sampleSuggestion({
                totalBeforeMinor: 0,
                totalAfterMinor: 1000000,
                classes: [contributionClass({ systemKey: 'cripto', colorKey: 'c8', note: 'no_assets', assets: [] })]
            })
        });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Cadastre ativos para direcionar este valor')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Cadastrar ativos' })).toHaveAttribute('href', '/portfolio/get-started');
    });

    it('429 mostra a mensagem própria e tenta de novo', async () => {
        installContributionApi({ failure: { type: 'too_many_requests', status: 429 } });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText(/Muitas simulações em pouco tempo/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    });

    it('erro genérico mostra o alerta de falha', async () => {
        installContributionApi({ failure: { type: 'internal', status: 500 } });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Não foi possível calcular a sugestão.')).toBeInTheDocument();
    });

    it('falha ao carregar a moeda base mostra o erro', async () => {
        installContributionApi();
        server.use(
            http.get('*/allocation/settings', () => HttpResponse.json({ title: 'x', detail: 'falhou', status: 500 }, { status: 500 }))
        );
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar a moeda base.')).toBeInTheDocument();
    });
});

describe('aporte: idioma', () => {
    it('abre em inglês', async () => {
        installContributionApi();
        renderRouterAt(PATH, { signedIn: true });
        server.use(http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ locale: 'en' }))));

        expect(await screen.findByRole('textbox', { name: 'How much will you contribute (R$)' })).toBeInTheDocument();
        expect(await screen.findByText('Brazilian stocks')).toBeInTheDocument();
        expect(screen.getByText(/not investment advice/)).toBeInTheDocument();
        expect(screen.getByText('7.3% → 7.5% (target 12%)')).toBeInTheDocument();
    });
});
