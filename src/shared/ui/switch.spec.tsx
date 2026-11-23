import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './switch';

describe('Switch', () => {
    it('expõe o estado e o rótulo como interruptor', () => {
        render(<Switch checked label="Permitir o envio" onCheckedChange={vi.fn()} />);
        expect(screen.getByRole('switch', { name: 'Permitir o envio' })).toBeChecked();
    });

    it('o clique pede o estado contrário', async () => {
        const user: UserEvent = userEvent.setup();
        const onCheckedChange: (next: boolean) => void = vi.fn();
        render(<Switch checked={false} label="Permitir o envio" onCheckedChange={onCheckedChange} />);
        await user.click(screen.getByRole('switch', { name: 'Permitir o envio' }));
        expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('desligado e ocupado não respondem ao clique', async () => {
        const user: UserEvent = userEvent.setup();
        const onCheckedChange: (next: boolean) => void = vi.fn();
        const { rerender } = render(<Switch checked={false} disabled label="Permitir o envio" onCheckedChange={onCheckedChange} />);
        await user.click(screen.getByRole('switch'));
        rerender(<Switch checked={false} busy label="Permitir o envio" onCheckedChange={onCheckedChange} />);
        await user.click(screen.getByRole('switch'));
        expect(onCheckedChange).not.toHaveBeenCalled();
        expect(screen.getByRole('switch')).toHaveAttribute('aria-busy', 'true');
    });
});
