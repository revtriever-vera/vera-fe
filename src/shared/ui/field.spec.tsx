import { describe, expect, it } from 'vitest';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Field } from './field';

describe('Field', () => {
    it('esconde a senha por padrão e revela ao clicar no olhinho', async () => {
        const user: UserEvent = userEvent.setup();
        render(<Field label="Senha" name="password" type="password" />);

        const input: HTMLInputElement = screen.getByLabelText('Senha');
        expect(input.type).toBe('password');

        await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
        expect(input.type).toBe('text');

        await user.click(screen.getByRole('button', { name: 'Ocultar senha' }));
        expect(input.type).toBe('password');
    });

    it('não mostra o olhinho em campos que não são de senha', () => {
        render(<Field label="E-mail" name="email" type="email" />);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('mostra o erro e marca o campo como inválido', () => {
        render(<Field label="E-mail" name="email" type="email" error="E-mail inválido" />);

        const input: HTMLInputElement = screen.getByLabelText('E-mail');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-describedby', 'email-error');
        expect(screen.getByRole('alert')).toHaveTextContent('E-mail inválido');
    });

    it('mostra a dica só quando não há erro', () => {
        render(<Field label="E-mail" name="email" type="email" hint="Usamos para contato" />);

        expect(screen.getByText('Usamos para contato')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
