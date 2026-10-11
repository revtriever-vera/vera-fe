import { describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { SelectMenu, type SelectChoice } from './select-menu';

const CHOICES: readonly SelectChoice[] = [
    { value: 'real', label: 'Real', warning: null },
    { value: 'dolar', label: 'Dólar', warning: 'Integração em beta' }
];

describe('SelectMenu', () => {
    it('mostra o placeholder quando não há valor', () => {
        render(<SelectMenu value="" choices={CHOICES} placeholder="Escolha a moeda" onChange={vi.fn()} />);

        expect(screen.getByText('Escolha a moeda')).toBeInTheDocument();
    });

    it('escolhe uma opção e avisa quem chamou', async () => {
        const onChange: Mock = vi.fn();
        const user: UserEvent = userEvent.setup();
        render(<SelectMenu value="" choices={CHOICES} placeholder="Escolha a moeda" onChange={onChange} />);

        await user.click(screen.getByRole('combobox'));
        await user.click(await screen.findByRole('option', { name: /Real/ }));

        expect(onChange).toHaveBeenCalledWith('real');
    });

    it('mostra o ícone à esquerda quando recebido', () => {
        render(
            <SelectMenu
                value=""
                choices={CHOICES}
                placeholder="Escolha a moeda"
                leading={<span data-testid="leading-icon" />}
                onChange={vi.fn()}
            />
        );

        expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
    });

    it('esconde a marca de selecionado quando showCheck é falso', async () => {
        const user: UserEvent = userEvent.setup();
        render(<SelectMenu value="real" choices={CHOICES} placeholder="Escolha a moeda" showCheck={false} onChange={vi.fn()} />);

        await user.click(screen.getByRole('combobox'));

        expect(screen.getAllByRole('option')[0]?.querySelector('svg')).toBeNull();
    });

    it('mostra o ícone da opção e o aviso quando existirem', async () => {
        const user: UserEvent = userEvent.setup();
        render(
            <SelectMenu
                value=""
                choices={[{ value: 'dolar', label: 'Dólar', warning: 'Integração em beta', icon: <span>N</span> }]}
                placeholder="Escolha a moeda"
                onChange={vi.fn()}
            />
        );

        await user.click(screen.getByRole('combobox'));

        expect(screen.getByLabelText('Integração em beta')).toBeInTheDocument();
    });
});
