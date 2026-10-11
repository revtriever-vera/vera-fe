import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pager } from './pager';

describe('o paginador', () => {
    it('some quando só existe uma página', () => {
        const { container } = render(<Pager page={1} totalPages={1} onChange={(): void => undefined} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('desabilita o anterior na primeira página e avança ao clicar em próxima', async () => {
        const onChange: Mock = vi.fn();
        render(<Pager page={1} totalPages={3} onChange={onChange} />);

        expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
        await userEvent.click(screen.getByRole('button', { name: 'Próxima' }));
        expect(onChange).toHaveBeenCalledWith(2);
    });

    it('desabilita a próxima na última página e volta ao clicar em anterior', async () => {
        const onChange: Mock = vi.fn();
        render(<Pager page={3} totalPages={3} onChange={onChange} />);

        expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();
        expect(screen.getByText('3 / 3')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
        expect(onChange).toHaveBeenCalledWith(2);
    });
});
