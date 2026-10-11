import { describe, expect, it, vi, type Mock } from 'vitest';
import { screen, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/render';
import { DateField } from './date-field';

describe('DateField', () => {
    it('mostra a data em dd/mm/aaaa, e não no formato do navegador', () => {
        renderWithProviders(<DateField label="De" value="2026-09-08" onChange={vi.fn()} />);

        expect(screen.getByLabelText('De')).toHaveValue('08/09/2026');
    });

    it('devolve ISO quando a data digitada fica completa', async () => {
        const onChange: Mock<(iso: string | null) => void> = vi.fn();
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<DateField label="De" value={null} onChange={onChange} />);

        await user.type(screen.getByLabelText('De'), '08092026');

        expect(screen.getByLabelText('De')).toHaveValue('08/09/2026');
        expect(onChange).toHaveBeenLastCalledWith('2026-09-08');
    });

    it('marca como inválida a data que não existe, sem avisar quem chamou', async () => {
        const onChange: Mock<(iso: string | null) => void> = vi.fn();
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<DateField label="De" value={null} onChange={onChange} />);

        await user.type(screen.getByLabelText('De'), '31022026');

        expect(screen.getByLabelText('De')).toHaveAttribute('aria-invalid', 'true');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('não aceita data digitada fora da janela permitida', async () => {
        const onChange: Mock<(iso: string | null) => void> = vi.fn();
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<DateField label="De" value={null} min="2026-08-01" max="2026-09-08" onChange={onChange} />);

        await user.type(screen.getByLabelText('De'), '15092026');

        expect(onChange).not.toHaveBeenCalled();
    });

    it('reflete a data quando o valor muda por fora, sem o campo ter sido editado', () => {
        const onChange: Mock<(iso: string | null) => void> = vi.fn();
        const result: RenderResult = renderWithProviders(<DateField label="De" value="2026-09-08" onChange={onChange} />);

        result.rerender(<DateField label="De" value="2026-10-02" onChange={onChange} />);

        expect(screen.getByLabelText('De')).toHaveValue('02/10/2026');
    });
});
