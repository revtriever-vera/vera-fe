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
});
