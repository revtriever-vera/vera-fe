import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { track } from '@/shared/lib/analytics';
import { sessionIdentity } from '../../../test/fixtures/auth';
import type { FgcHolderBlock } from '@/features/portfolio/fixed-income/types';
import { fgcCoverage } from '../../../test/fixtures/fixed-income';
import { member, membersList } from '../../../test/fixtures/members';
import { ANA } from '../../../test/fixtures/people';
import { holding, sampleHoldings, sampleOverview } from '../../../test/fixtures/portfolio';
import { installClassDetailApi } from '../../../test/helpers/class-detail-api';
import { mockHoldingsApi, type HoldingsApi } from '../../../test/helpers/holdings-api';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const FILTER: string = 'Filtrar por titular';

function alone(): void {
    server.use(http.get('*/members', (): Response => HttpResponse.json(membersList({ members: [member()], invites: [] }))));
}

function seen(path: string): string[] {
    const holders: string[] = [];
    server.use(
        http.get(path, ({ request }): Response => {
            holders.push(new URL(request.url).searchParams.get('holder') ?? '');
            return HttpResponse.json(path.endsWith('overview') ? sampleOverview() : sampleHoldings());
        })
    );
    return holders;
}

describe('titular: com uma pessoa só', () => {
    it('não mostra filtro nem coluna em nenhuma das três telas', async () => {
        alone();
        mockHoldingsApi();
        installClassDetailApi();
        server.use(http.get('*/portfolio/overview', (): Response => HttpResponse.json(sampleOverview())));
        renderRouterAt('/portfolio/assets', { signedIn: true });
        await screen.findByLabelText('Quantidade de ITUB4');

        expect(screen.queryByRole('radiogroup', { name: FILTER })).toBeNull();
        expect(screen.queryByRole('columnheader', { name: 'Titular' })).toBeNull();
        expect(screen.queryByRole('combobox', { name: 'Titular de ITUB4' })).toBeNull();
    });
});

describe('titular: com duas pessoas', () => {
    it('Meus ativos mostra o filtro, a coluna e o seletor de cada ativo', async () => {
        mockHoldingsApi();
        renderRouterAt('/portfolio/assets', { signedIn: true });
        await screen.findByLabelText('Quantidade de ITUB4');

        expect(await screen.findByRole('radiogroup', { name: FILTER })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Titular' })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Titular de ITUB4' })).toHaveTextContent('Conta toda');
    });

    it('a Visão geral mostra o filtro', async () => {
        server.use(http.get('*/portfolio/overview', (): Response => HttpResponse.json(sampleOverview())));
        renderRouterAt('/portfolio', { signedIn: true });
        expect(await screen.findByRole('radiogroup', { name: FILTER })).toBeInTheDocument();
    });

    it('a tela da classe mostra o filtro', async () => {
        installClassDetailApi();
        renderRouterAt('/portfolio/classes/class-acoes-br', { signedIn: true });
        expect(await screen.findByRole('radiogroup', { name: FILTER })).toBeInTheDocument();
    });

    it('Carteira-alvo não tem o filtro', async () => {
        renderRouterAt('/portfolio/targets', { signedIn: true });
        await screen.findByRole('navigation', { name: 'Seções da carteira' });

        expect(screen.queryByRole('radiogroup', { name: FILTER })).toBeNull();
    });

    it('trocar o filtro vai para ?holder= e a leitura sai filtrada; Todos limpa', async () => {
        mockHoldingsApi();
        const holders: string[] = seen('*/portfolio/holdings');
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt('/portfolio/assets', { signedIn: true });
        const group: HTMLElement = await screen.findByRole('radiogroup', { name: FILTER });
        await screen.findByLabelText('Quantidade de ITUB4');

        await user.click(within(group).getByRole('radio', { name: 'Ana Souza' }));

        await waitFor(() => {
            expect(router.state.location.search).toEqual({ holder: ANA.userId });
        });
        await waitFor(() => {
            expect(holders).toContain(ANA.userId);
        });
        expect(track).toHaveBeenCalledWith('holder_filter_changed', { kind: 'person' });

        await user.click(within(group).getByRole('radio', { name: 'Todos' }));
        await waitFor(() => {
            expect(router.state.location.search).toEqual({});
        });
        expect(track).toHaveBeenCalledWith('holder_filter_changed', { kind: 'any' });
    });

    it('?holder= persiste ao abrir a tela e marca o botão certo', async () => {
        mockHoldingsApi();
        const holders: string[] = seen('*/portfolio/holdings');
        renderRouterAt('/portfolio/assets?holder=all', { signedIn: true });
        const group: HTMLElement = await screen.findByRole('radiogroup', { name: FILTER });

        await waitFor(() => {
            expect(within(group).getByRole('radio', { name: 'Conta toda' })).toBeChecked();
        });
        expect(holders).toContain('all');
    });

    it('um valor inválido em ?holder= vira Todos', async () => {
        mockHoldingsApi();
        const holders: string[] = seen('*/portfolio/holdings');
        renderRouterAt('/portfolio/assets?holder=lixo', { signedIn: true });
        await screen.findByRole('radiogroup', { name: FILTER });

        await waitFor(() => {
            expect(holders).toContain('');
        });
        expect(holders).not.toContain('lixo');
    });

    it('a Visão geral com a Ana sem ativos mostra o estado vazio filtrado', async () => {
        server.use(
            http.get('*/portfolio/overview', (): Response =>
                HttpResponse.json({ ...sampleOverview(), empty: true, classes: [], largestDeviation: null })
            )
        );
        renderRouterAt(`/portfolio?holder=${ANA.userId}`, { signedIn: true });

        expect(await screen.findByText('Nenhum ativo de Ana Souza')).toBeInTheDocument();
        expect(screen.getByText('Troque o filtro de titular ou marque o titular de cada ativo em Meus ativos.')).toBeInTheDocument();
    });

    it('Meus ativos filtrado e vazio mostra o estado vazio filtrado', async () => {
        mockHoldingsApi({ holdings: { ...sampleHoldings(), data: [] } });
        renderRouterAt('/portfolio/assets?holder=all', { signedIn: true });

        expect(await screen.findByText('Nenhum ativo de Conta toda')).toBeInTheDocument();
    });

    it('as abas Visão geral e Meus ativos carregam o filtro; Carteira-alvo o solta', async () => {
        mockHoldingsApi();
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt(`/portfolio/assets?holder=${ANA.userId}`, { signedIn: true });
        await screen.findByRole('radiogroup', { name: FILTER });
        const nav: HTMLElement = screen.getByRole('navigation', { name: 'Seções da carteira' });

        expect(within(nav).getByRole('link', { name: 'Visão geral' })).toHaveAttribute('href', `/portfolio?holder=${ANA.userId}`);
        await user.click(within(nav).getByRole('link', { name: 'Carteira-alvo' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/portfolio/targets');
        });
        expect(router.state.location.search).toEqual({});
    });
});

describe('titular: seletor inline', () => {
    it('trocar o titular de um ativo chama o PATCH da posição e avisa', async () => {
        const api: HoldingsApi = mockHoldingsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/portfolio/assets', { signedIn: true });
        await screen.findByLabelText('Quantidade de ITUB4');

        await user.click(screen.getByRole('combobox', { name: 'Titular de ITUB4' }));
        await user.click(await screen.findByRole('option', { name: 'Ana Souza' }));

        expect(await screen.findByText('ITUB4: titular Ana Souza')).toBeInTheDocument();
        expect(api.patched).toEqual([{ id: 'itub4', body: { holderUserId: ANA.userId } }]);
        expect(track).toHaveBeenCalledWith('holder_set', { kind: 'person', source: 'inline' });
    });

    it('um título de renda fixa vai pelo PATCH do título, e Conta toda manda nulo', async () => {
        const api: HoldingsApi = mockHoldingsApi({
            holdings: {
                ...sampleHoldings(),
                data: [
                    holding({
                        kind: 'fixed_income',
                        id: 'title-1',
                        assetId: null,
                        symbol: 'CDB Inter',
                        market: null,
                        typeGroup: 'fixed_income',
                        holder: { userId: ANA.userId, name: ANA.name }
                    })
                ]
            }
        });
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/portfolio/assets', { signedIn: true });
        const select: HTMLElement = await screen.findByRole('combobox', { name: 'Titular de CDB Inter' });
        expect(select).toHaveTextContent('Ana Souza');

        await user.click(select);
        await user.click(await screen.findByRole('option', { name: 'Conta toda' }));

        await waitFor(() => {
            expect(api.titlePatched).toEqual([{ id: 'title-1', body: { holderUserId: null } }]);
        });
    });

    it('Leitura vê o titular como texto, sem o seletor, e vê o filtro', async () => {
        mockHoldingsApi({
            holdings: { ...sampleHoldings(), data: [holding({ holder: { userId: ANA.userId, name: ANA.name } })] }
        });
        server.use(
            http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ role: 'viewer' }))),
            ...signedInHandlers()
        );
        renderRouterAt('/portfolio/assets');
        await screen.findByRole('table', { name: 'Seus ativos' });

        expect(await screen.findByRole('radiogroup', { name: FILTER })).toBeInTheDocument();
        expect(screen.queryByRole('combobox', { name: 'Titular de ITUB4' })).toBeNull();
        expect(within(screen.getByRole('table', { name: 'Seus ativos' })).getByText('Ana Souza')).toBeInTheDocument();
    });
});

describe('titular: edição do título', () => {
    it('o modal mostra o titular atual e o salvar leva o novo', async () => {
        const api: HoldingsApi = mockHoldingsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/portfolio/assets', { signedIn: true });
        await screen.findByLabelText('Quantidade de ITUB4');

        await user.click(screen.getByRole('button', { name: 'Editar CDB Inter' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Editar CDB Inter' });
        const field: HTMLElement = await within(dialog).findByRole('combobox', { name: 'Titular' });
        expect(field).toHaveTextContent('Conta toda');
        await user.click(field);
        await user.click(await screen.findByRole('option', { name: 'Ana Souza' }));
        await user.click(within(dialog).getByRole('button', { name: 'Salvar alterações' }));

        await waitFor(() => {
            expect(api.titlePatched).toHaveLength(1);
        });
        expect(api.titlePatched[0]).toMatchObject({ id: 'fi-cdb', body: { holderUserId: ANA.userId } });
        expect(track).toHaveBeenCalledWith('holder_set', { kind: 'person', source: 'edit' });
    });
});

describe('titular: FGC na aba Renda fixa', () => {
    it('pede a cobertura do titular filtrado e mostra o bloco dele', async () => {
        mockHoldingsApi();
        const holders: string[] = [];
        server.use(
            http.get('*/portfolio/fgc', ({ request }): Response => {
                holders.push(new URL(request.url).searchParams.get('holder') ?? '');
                return HttpResponse.json(fgcCoverage({ scope: 'holder', peopleCount: 2 }));
            })
        );
        renderRouterAt(`/portfolio/assets?tab=fixed-income&holder=${ANA.userId}`, { signedIn: true });

        expect(await screen.findByText('Conglomerado Alfa')).toBeInTheDocument();
        expect(holders).toEqual([ANA.userId]);
        expect(screen.getByText(/O limite do FGC vale por CPF/)).toHaveTextContent('para ver só a cobertura de uma pessoa');
    });

    it('sem filtro pede Todos e mostra um bloco por titular', async () => {
        mockHoldingsApi();
        const holders: string[] = [];
        const block = (name: string | null): FgcHolderBlock => ({
            holder: name === null ? null : { userId: ANA.userId, name },
            coveredMinor: 0,
            capShareBps: 0,
            groups: [],
            outside: []
        });
        server.use(
            http.get('*/portfolio/fgc', ({ request }): Response => {
                holders.push(new URL(request.url).searchParams.get('holder') ?? '');
                return HttpResponse.json(fgcCoverage({ peopleCount: 2, groups: [], byHolder: [block('Ana Souza'), block(null)] }));
            })
        );
        renderRouterAt('/portfolio/assets?tab=fixed-income', { signedIn: true });

        expect(await screen.findByRole('region', { name: 'Ana Souza' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Conta toda' })).toBeInTheDocument();
        expect(holders).toEqual(['']);
    });
});
