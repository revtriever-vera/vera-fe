import { describe, expect, it, vi, type Mock } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { i18n } from '@/shared/lib/i18n';
import { holding, sampleHoldings, SAMPLE_TOTAL_MINOR } from '../../../../../test/fixtures/portfolio';
import { mockWalletApi, type WalletApi } from '../../../../../test/helpers/wallet-api';
import { renderWithProviders } from '../../../../../test/render';
import { server } from '../../../../../test/msw/server';
import { AssetsStep, type AssetsStepState } from './assets-step';

function renderStep(footer: (state: AssetsStepState) => ReactNode = (state) => <p>{`rodape ${state.count}`}</p>, eyebrow?: string): void {
    renderWithProviders(<AssetsStep eyebrow={eyebrow} footer={footer} />);
}

describe('AssetsStep', () => {
    it('vazia: sete cards, coluna zerada e eyebrow do wizard', async () => {
        mockWalletApi([]);
        renderStep(undefined, 'Etapa 1 de 2 · opcional');

        expect(await screen.findByRole('heading', { name: 'Sua carteira (0)' })).toBeInTheDocument();
        expect(screen.getByText('Etapa 1 de 2 · opcional')).toBeInTheDocument();
        expect(within(screen.getByRole('group', { name: 'Tipos de investimento' })).getAllByRole('button')).toHaveLength(7);
        expect(await screen.findByText('Nenhum ativo ainda. Escolha um tipo ao lado.')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Por que essa etapa existe' })).toBeInTheDocument();
        expect(screen.getByText('Por que o cadastro é manual?')).toBeInTheDocument();
    });

    it('ITUB4: abre o modal no passo 2 e a coluna cresce ao vivo, com o rodapé recebendo o estado', async () => {
        mockWalletApi([]);
        const footer: Mock<(state: AssetsStepState) => ReactNode> = vi.fn((state: AssetsStepState): ReactNode => (
            <p>{`rodape ${state.count}`}</p>
        ));
        const user: UserEvent = userEvent.setup();
        renderStep(footer);
        await screen.findByText('Nenhum ativo ainda. Escolha um tipo ao lado.');

        await user.click(
            within(screen.getByRole('group', { name: 'Tipos de investimento' })).getByRole('button', { name: /Ações brasileiras/ })
        );
        expect(await screen.findByRole('dialog', { name: 'Ações brasileiras' })).toBeInTheDocument();
        await user.click(await screen.findByRole('option', { name: /ITUB4/ }));
        const field: HTMLElement = await screen.findByRole('textbox', { name: 'Quantidade' });
        await user.type(field, '100');
        await user.click(screen.getByRole('button', { name: 'Adicionar à carteira' }));

        expect(await screen.findByRole('heading', { name: 'Sua carteira (1)' })).toBeInTheDocument();
        const list: HTMLElement = screen.getByRole('list', { name: 'Ativos da carteira' });
        expect(within(list).getByText('ITUB4')).toBeInTheDocument();
        expect(within(list).getByText('Ações Brasil · 100 cotas')).toBeInTheDocument();
        expect(within(list).getByText('R$ 3.780,00')).toBeInTheDocument();
        expect(screen.getByText('rodape 1')).toBeInTheDocument();
        expect(footer).toHaveBeenLastCalledWith({ count: 1, totalMinor: 378000, baseCurrency: 'BRL' });
    });

    it('carteira de exemplo: 19 ativos, total, cripto em un. e Tesouro em títulos', async () => {
        mockWalletApi(sampleHoldings().data);
        renderStep();

        expect(await screen.findByRole('heading', { name: 'Sua carteira (19)' })).toBeInTheDocument();
        expect(screen.getByText('R$ 1.773.100,40')).toBeInTheDocument();
        expect(SAMPLE_TOTAL_MINOR).toBe(177310040);
        const list: HTMLElement = screen.getByRole('list', { name: 'Ativos da carteira' });
        expect(within(list).getByText(/· 0,45 un\.$/)).toBeInTheDocument();
        expect(within(list).getAllByText(/ 3,2 títulos$/).length).toBeGreaterThan(0);
        expect(within(list).getAllByRole('listitem')).toHaveLength(19);
    });

    it('remove uma posição depois de confirmar e atualiza a coluna', async () => {
        const api: WalletApi = mockWalletApi([holding({ id: 'p1', symbol: 'ITUB4' }), holding({ id: 'p2', symbol: 'BBAS3' })]);
        const user: UserEvent = userEvent.setup();
        renderStep();

        await user.click(await screen.findByRole('button', { name: 'Remover ITUB4' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Remover ITUB4?' });
        expect(api.deleted).toEqual([]);
        await user.click(within(dialog).getByRole('button', { name: 'Remover' }));

        expect(await screen.findByRole('heading', { name: 'Sua carteira (1)' })).toBeInTheDocument();
        expect(api.deleted).toEqual(['positions/p1']);
        expect(screen.getByText('ITUB4 removido')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Remover ITUB4' })).toBeNull();
    });

    it('remove um título de renda fixa pelo DELETE de títulos e permite cancelar', async () => {
        const api: WalletApi = mockWalletApi([
            holding({ id: 't1', kind: 'fixed_income', typeGroup: 'fixed_income', symbol: 'CDB Banco X', quantity: null })
        ]);
        const user: UserEvent = userEvent.setup();
        renderStep();

        await user.click(await screen.findByRole('button', { name: 'Remover CDB Banco X' }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).toBeNull();
        });
        expect(api.deleted).toEqual([]);

        await user.click(screen.getByRole('button', { name: 'Remover CDB Banco X' }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Remover' }));

        await screen.findByText('Nenhum ativo ainda. Escolha um tipo ao lado.');
        expect(api.deleted).toEqual(['fixed-income/titles/t1']);
    });

    it('avisa quando a remoção falha e mantém o ativo', async () => {
        mockWalletApi([holding({ id: 'p1', symbol: 'ITUB4' })]);
        server.use(
            http.delete('*/positions/:id', () =>
                HttpResponse.json(
                    { type: 'positions.position_not_found', title: 'x', status: 404, detail: 'x', requestId: null },
                    { status: 404 }
                )
            )
        );
        const user: UserEvent = userEvent.setup();
        renderStep();

        await user.click(await screen.findByRole('button', { name: 'Remover ITUB4' }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Remover' }));

        expect(await screen.findByText('Não foi possível remover')).toBeInTheDocument();
    });

    it('ativo sem cotação mostra traço e o chip de atenção, fora do total', async () => {
        mockWalletApi([
            holding({ id: 'p1', symbol: 'ITUB4', valueMinor: 1000 }),
            holding({ id: 'p2', symbol: 'NOVO3', valueMinor: 0, missingQuote: true }),
            holding({ id: 'p3', symbol: 'AAPL', valueMinor: 0, missingRate: true })
        ]);
        renderStep();

        expect(await screen.findByText('Sem cotação')).toBeInTheDocument();
        expect(screen.getByText('Sem câmbio')).toBeInTheDocument();
        expect(screen.getAllByText('—')).toHaveLength(2);
        expect(screen.getAllByText('R$ 10,00')).toHaveLength(2);
    });

    it('erro de carga fica dentro da coluna e não derruba os cards', async () => {
        server.use(
            http.get('*/portfolio/holdings', () =>
                HttpResponse.json({ type: 'x', title: 'x', status: 500, detail: 'falhou', requestId: 'r1' }, { status: 500 })
            )
        );
        renderStep();

        expect(await screen.findByText('Não foi possível carregar a carteira.')).toBeInTheDocument();
        expect(screen.getByRole('group', { name: 'Tipos de investimento' })).toBeInTheDocument();
    });

    it('em inglês', async () => {
        await i18n.changeLanguage('en');
        mockWalletApi([holding({ id: 'p1', symbol: 'ITUB4', quantity: '100' })]);
        renderStep();

        expect(await screen.findByRole('heading', { name: 'Your portfolio (1)' })).toBeInTheDocument();
        expect(screen.getByText('Brazilian stocks · 100 shares')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove ITUB4' })).toBeInTheDocument();
        await i18n.changeLanguage('pt-BR');
    });
});
