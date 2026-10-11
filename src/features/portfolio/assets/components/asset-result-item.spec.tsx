import { describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { IVVB11, catalogAsset } from '../../../../../test/fixtures/assets';
import { renderWithProviders } from '../../../../../test/render';
import { AssetResultItem, type AssetResultItemProps } from './asset-result-item';

function props(overrides: Partial<AssetResultItemProps> = {}): AssetResultItemProps {
    return {
        asset: catalogAsset(),
        colorKey: 'c4',
        price: { state: 'ready', text: 'R$ 37,80' },
        selected: false,
        held: false,
        tabIndex: 0,
        onPick: vi.fn(),
        ...overrides
    };
}

describe('AssetResultItem', () => {
    it('mostra símbolo, nome, tipo e preço', () => {
        renderWithProviders(<AssetResultItem {...props()} />);

        expect(screen.getByRole('option', { name: /ITUB4/ })).toBeInTheDocument();
        expect(screen.getByText('Itaú Unibanco PN')).toBeInTheDocument();
        expect(screen.getByText('R$ 37,80')).toBeInTheDocument();
        expect(screen.getByText(/Ação/)).toBeInTheDocument();
    });

    it('mostra o chip Já na carteira só quando o ativo já está lá', () => {
        const { rerender } = render(<AssetResultItem {...props()} />);
        expect(screen.queryByText('Já na carteira')).toBeNull();

        rerender(<AssetResultItem {...props({ held: true })} />);
        expect(screen.getByText('Já na carteira')).toBeInTheDocument();
    });

    it('mostra o aviso de exposição', () => {
        renderWithProviders(<AssetResultItem {...props({ asset: IVVB11 })} />);

        expect(screen.getByText('ETF negociado na B3 com exposição a ações dos EUA')).toBeInTheDocument();
    });

    it('mostra os estados do preço', () => {
        const { rerender } = render(<AssetResultItem {...props({ price: { state: 'pending' } })} />);
        expect(screen.getByText('buscando preço…')).toBeInTheDocument();

        rerender(<AssetResultItem {...props({ price: { state: 'unavailable' } })} />);
        expect(screen.getByText('preço indisponível')).toBeInTheDocument();
    });

    it('marca o escolhido e avisa o clique', async () => {
        const user: UserEvent = userEvent.setup();
        const onPick: Mock = vi.fn();
        render(<AssetResultItem {...props({ selected: true, onPick })} />);

        const option: HTMLElement = screen.getByRole('option');
        expect(option).toHaveAttribute('aria-selected', 'true');
        await user.click(option);

        expect(onPick).toHaveBeenCalledWith(catalogAsset());
    });
});
