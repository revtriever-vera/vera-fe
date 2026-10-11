import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { CopyField } from './copy-field';

function stubClipboard(): MockInstance {
    Object.defineProperty(window.navigator, 'clipboard', {
        value: { writeText: (): Promise<void> => Promise.resolve() },
        configurable: true
    });
    return vi.spyOn(navigator.clipboard, 'writeText');
}

describe('CopyField', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('copia o valor e confirma por um tempo limitado', async () => {
        vi.useFakeTimers();
        const writeText: MockInstance = stubClipboard();
        render(<CopyField value="https://api.test/webhooks/abc" copyLabel="Copiar" />);

        fireEvent.click(screen.getByRole('button', { name: 'Copiar' }));
        await act(async (): Promise<void> => {
            await Promise.resolve();
        });

        expect(writeText).toHaveBeenCalledExactlyOnceWith('https://api.test/webhooks/abc');
        expect(screen.getByRole('button', { name: 'Copiado' })).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.getByRole('button', { name: 'Copiar' })).toBeInTheDocument();
    });

    it('usa o rótulo de cópia recebido', async () => {
        const user: UserEvent = userEvent.setup();
        render(<CopyField value="chave-pix" copyLabel="Copiar chave" />);

        expect(screen.getByText('chave-pix')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Copiar chave' }));

        expect(await screen.findByRole('button', { name: 'Copiado' })).toBeInTheDocument();
    });
});
