import type { ReactElement } from 'react';
import { describe, expect, it, vi, type MockInstance } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { SampleDataContext, type SampleDataControls } from '@/shared/lib/sample-data/sample-data-context';
import { SampleDataButton } from './sample-data-button';

function controls(overrides: Partial<SampleDataControls> = {}): SampleDataControls {
    return {
        available: true,
        active: false,
        isLoading: false,
        load: vi.fn((): Promise<void> => Promise.resolve()),
        clear: vi.fn((): Promise<void> => Promise.resolve()),
        ...overrides
    };
}

function renderWith(value: SampleDataControls): void {
    const ui: ReactElement = (
        <SampleDataContext value={value}>
            <SampleDataButton />
        </SampleDataContext>
    );
    render(ui);
}

describe('SampleDataButton', () => {
    it('some quando não há dados de exemplo disponíveis', () => {
        renderWith(controls({ available: false }));

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('some quando o exemplo já está ativo', () => {
        renderWith(controls({ active: true }));

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('chama load ao clicar', async () => {
        const user: UserEvent = userEvent.setup();
        const value: SampleDataControls = controls();
        renderWith(value);

        await user.click(screen.getByRole('button', { name: 'Explorar com dados de exemplo' }));

        expect(value.load).toHaveBeenCalledTimes(1);
    });

    it('fica desabilitado durante a carga', async () => {
        const user: UserEvent = userEvent.setup();
        const value: SampleDataControls = controls({ isLoading: true });
        renderWith(value);

        const button: HTMLElement = screen.getByRole('button', { name: 'Explorar com dados de exemplo' });
        await user.click(button);

        expect(button).toBeDisabled();
        expect(value.load).not.toHaveBeenCalled();
    });

    it('falha de forma clara fora do provider', () => {
        const spy: MockInstance = vi.spyOn(console, 'error').mockImplementation((): void => undefined);

        expect(() => render(<SampleDataButton />)).toThrow('useSampleData must be used inside SampleDataProvider');

        spy.mockRestore();
    });
});
