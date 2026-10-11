import { describe, expect, it, vi, type Mock } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { holding, sampleHoldings } from '../../../../../test/fixtures/portfolio';
import { server } from '../../../../../test/msw/server';
import { renderWithProviders } from '../../../../../test/render';
import { AssetTypeCards } from './asset-type-cards';

describe('AssetTypeCards', () => {
    it('mostra os sete tipos com nome e descrição', async () => {
        renderWithProviders(<AssetTypeCards onSelect={vi.fn()} />);
        const group: HTMLElement = await screen.findByRole('group', { name: 'Tipos de investimento' });

        const cards: HTMLElement[] = within(group).getAllByRole('button');
        expect(cards.map((card: HTMLElement): string => card.querySelector('span span')?.textContent ?? '')).toEqual([
            'Renda fixa',
            'Tesouro Direto',
            'Ações brasileiras',
            'Fundos imobiliários',
            'Ações americanas',
            'REITs',
            'Criptomoedas'
        ]);
        expect(screen.getByText('CDB, LCI, LCA, LC, debêntures')).toBeInTheDocument();
        expect(screen.getByText('Bitcoin, Ethereum e outras')).toBeInTheDocument();
    });

    it('conta os ativos que a pessoa já tem em cada tipo', async () => {
        server.use(
            http.get('*/portfolio/holdings', () =>
                HttpResponse.json({
                    ...sampleHoldings(),
                    data: [
                        holding({ id: 'a', typeGroup: 'fii' }),
                        holding({ id: 'b', typeGroup: 'fii' }),
                        holding({ id: 'c', typeGroup: 'cripto' })
                    ]
                })
            )
        );
        renderWithProviders(<AssetTypeCards onSelect={vi.fn()} />);

        expect(await screen.findByText('2 ativos')).toBeInTheDocument();
        expect(screen.getByText('1 ativo')).toBeInTheDocument();
        expect(screen.getAllByText(/\d+ ativos?$/)).toHaveLength(2);
    });

    it('avisa o tipo escolhido pelo clique e pelo teclado', async () => {
        const onSelect: Mock = vi.fn();
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<AssetTypeCards onSelect={onSelect} />);

        await user.click(await screen.findByRole('button', { name: /Renda fixa/ }));
        screen.getByRole('button', { name: /REITs/ }).focus();
        await user.keyboard('{Enter}');

        expect(onSelect).toHaveBeenNthCalledWith(1, 'fixed_income');
        expect(onSelect).toHaveBeenNthCalledWith(2, 'reits');
    });

    it('percorre os cards com Tab e foca o tipo pedido', async () => {
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<AssetTypeCards onSelect={vi.fn()} focusType="fii" />);

        const fii: HTMLElement = await screen.findByRole('button', { name: /Fundos imobiliários/ });
        expect(fii).toHaveFocus();
        await user.tab();

        expect(screen.getByRole('button', { name: /Ações americanas/ })).toHaveFocus();
    });
});
