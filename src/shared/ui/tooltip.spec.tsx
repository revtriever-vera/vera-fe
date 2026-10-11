import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { Balloon, RichBalloon } from './tooltip';

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

describe('RichBalloon', () => {
    it('abre em hover com o conteúdo rico', async () => {
        const user: UserEvent = userEvent.setup();
        render(
            <RichBalloon content={<strong>Detalhe da classe</strong>}>
                <button type="button">Classe</button>
            </RichBalloon>
        );

        await user.hover(screen.getByRole('button', { name: 'Classe' }));

        expect(await screen.findByRole('tooltip')).toHaveTextContent('Detalhe da classe');
        expect(screen.getAllByText('Detalhe da classe').length).toBeGreaterThan(0);
    });

    it('abre ao focar e fecha com Esc', async () => {
        const user: UserEvent = userEvent.setup();
        render(
            <RichBalloon content="Mais detalhes">
                <button type="button">Classe</button>
            </RichBalloon>
        );

        await user.tab();
        expect(await screen.findByRole('tooltip')).toBeInTheDocument();

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('abre ao tocar e continua aberto depois do toque', async () => {
        render(
            <RichBalloon content="Mais detalhes">
                <button type="button">Classe</button>
            </RichBalloon>
        );

        fireEvent.pointerDown(screen.getByRole('button', { name: 'Classe' }), { pointerType: 'touch' });
        fireEvent.click(screen.getByRole('button', { name: 'Classe' }));

        expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    });
});
