import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { Balloon } from './tooltip';

describe('Balloon', () => {
    it('mostra o texto ao focar o gatilho e o esconde ao sair', async () => {
        const user: UserEvent = userEvent.setup();
        render(
            <Balloon text="Copia o identificador">
                <button type="button">Copiar</button>
            </Balloon>
        );

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

        await user.tab();
        expect(await screen.findByRole('tooltip', { name: 'Copia o identificador' })).toBeInTheDocument();

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('usa a animação própria do balão, e não classes de plugin ausente', async () => {
        const user: UserEvent = userEvent.setup();
        render(
            <Balloon text="Ajuda">
                <button type="button">Ajuda</button>
            </Balloon>
        );

        await user.hover(screen.getByRole('button', { name: 'Ajuda' }));
        const balloon: HTMLElement = await screen.findByRole('tooltip', { name: 'Ajuda' });

        expect(balloon).toHaveClass('balloon-in');
        expect(balloon).not.toHaveClass('animate-in');
    });
});
