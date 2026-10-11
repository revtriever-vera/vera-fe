import { describe, expect, it, vi, type Mock } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/render';
import { DateField } from './date-field';

describe('DateField: calendário', () => {
    it('escolhe o dia pelo calendário, em português', async () => {
        const onChange: Mock<(iso: string | null) => void> = vi.fn();
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<DateField label="De" value="2026-09-08" onChange={onChange} />);

        await user.click(screen.getByRole('button', { name: 'Abrir calendário de de' }));

        expect(await screen.findByText('setembro de 2026')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: '10 de setembro de 2026' }));

        expect(onChange).toHaveBeenCalledWith('2026-09-10');
    });

    it('navega para o mês anterior sem mudar a data escolhida', async () => {
        const onChange: Mock<(iso: string | null) => void> = vi.fn();
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<DateField label="De" value="2026-09-08" onChange={onChange} />);
        await user.click(screen.getByRole('button', { name: 'Abrir calendário de de' }));

        await user.click(await screen.findByRole('button', { name: 'Mês anterior' }));

        expect(screen.getByText('agosto de 2026')).toBeInTheDocument();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('marca hoje sem confundir com o dia escolhido', async () => {
        const user: UserEvent = userEvent.setup();
        const now: Date = new Date();
        const other: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate() === 1 ? 2 : 1);
        renderWithProviders(<DateField label="De" value={new Intl.DateTimeFormat('en-CA').format(other)} onChange={vi.fn()} />);
        await user.click(screen.getByRole('button', { name: 'Abrir calendário de de' }));

        const today: HTMLElement = await screen.findByRole('button', { current: 'date' });

        expect(today).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByRole('button', { pressed: true })).not.toBe(today);
    });

    it('trava o campo e o calendário quando desabilitado', () => {
        renderWithProviders(<DateField label="De" value="2026-09-08" disabled onChange={vi.fn()} />);

        expect(screen.getByLabelText('De')).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Abrir calendário de de' })).toBeDisabled();
    });

    it('avança de mês e escolhe o dia que estava no mês seguinte', async () => {
        const onChange: Mock<(iso: string | null) => void> = vi.fn();
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<DateField label="De" value="2026-09-08" onChange={onChange} />);
        await user.click(screen.getByRole('button', { name: 'Abrir calendário de de' }));

        await user.click(await screen.findByRole('button', { name: 'Próximo mês' }));
        await user.click(screen.getByRole('button', { name: '2 de outubro de 2026' }));

        expect(onChange).toHaveBeenCalledWith('2026-10-02');
    });

    it('avisa que a data saiu quando o campo é apagado, em vez de deixar a antiga valendo', async () => {
        const onChange: Mock<(iso: string | null) => void> = vi.fn();
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<DateField label="De" value="2026-09-08" onChange={onChange} />);

        await user.clear(screen.getByLabelText('De'));

        expect(screen.getByLabelText('De')).toHaveValue('');
        expect(onChange).toHaveBeenCalledWith(null);
    });

    it('não avisa ninguém enquanto a data está pela metade', async () => {
        const onChange: Mock<(iso: string | null) => void> = vi.fn();
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<DateField label="De" value={null} onChange={onChange} />);

        await user.type(screen.getByLabelText('De'), '0809');

        expect(screen.getByLabelText('De')).toHaveValue('08/09');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('não deixa clicar no dia fora da janela', async () => {
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<DateField label="Até" value="2026-09-08" min="2026-09-01" max="2026-09-08" onChange={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: 'Abrir calendário de até' }));

        expect(await screen.findByRole('button', { name: '30 de agosto de 2026' })).toBeDisabled();
    });
});
