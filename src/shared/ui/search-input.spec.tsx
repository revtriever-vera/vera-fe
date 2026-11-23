import { describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from './search-input';

describe('SearchInput', () => {
    it('avisa a cada digitação', async () => {
        const onChange: Mock = vi.fn();
        render(<SearchInput value="" onChange={onChange} placeholder="Buscar ativo" label="Buscar" />);

        await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar' }), 'a');

        expect(onChange).toHaveBeenCalledWith('a');
    });

    it('marca o combobox como recolhido e solta o controle da lista', () => {
        render(
            <SearchInput
                value=""
                onChange={vi.fn()}
                placeholder="Buscar"
                label="Buscar"
                combobox={{ listId: 'lista', activeId: undefined, expanded: false }}
            />
        );

        const box: HTMLElement = screen.getByRole('combobox', { name: 'Buscar' });
        expect(box).toHaveAttribute('aria-expanded', 'false');
        expect(box).not.toHaveAttribute('aria-controls');
    });

    it('marca o combobox como expandido por padrão', () => {
        render(
            <SearchInput
                value=""
                onChange={vi.fn()}
                placeholder="Buscar"
                label="Buscar"
                combobox={{ listId: 'lista', activeId: 'lista-a' }}
            />
        );

        const box: HTMLElement = screen.getByRole('combobox', { name: 'Buscar' });
        expect(box).toHaveAttribute('aria-expanded', 'true');
        expect(box).toHaveAttribute('aria-controls', 'lista');
        expect(box).toHaveAttribute('aria-activedescendant', 'lista-a');
    });
});
