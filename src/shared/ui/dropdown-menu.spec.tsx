import { describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { DropdownMenu } from './dropdown-menu';

describe('DropdownMenu', () => {
    it('abre o menu e dispara a ação do item escolhido', async () => {
        const onSelect: Mock = vi.fn();
        const user: UserEvent = userEvent.setup();
        render(
            <DropdownMenu
                trigger={<button type="button">Abrir</button>}
                items={[
                    { key: 'a', label: 'Primeiro', onSelect },
                    { key: 'b', label: 'Segundo', onSelect: vi.fn() }
                ]}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Abrir' }));
        expect(screen.getByRole('menu', { name: 'Abrir' })).toBeInTheDocument();
        await user.click(screen.getByRole('menuitem', { name: 'Primeiro' }));

        expect(onSelect).toHaveBeenCalledTimes(1);
    });
});
