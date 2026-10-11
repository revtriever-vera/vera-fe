import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { SampleDataContext, type SampleDataControls } from '@/shared/lib/sample-data/sample-data-context';
import { SampleDataBanner } from './sample-data-banner';

function controls(overrides: Partial<SampleDataControls> = {}): SampleDataControls {
    return {
        available: true,
        active: true,
        isLoading: false,
        load: vi.fn((): Promise<void> => Promise.resolve()),
        clear: vi.fn((): Promise<void> => Promise.resolve()),
        ...overrides
    };
}

function renderWith(value: SampleDataControls): void {
    render(
        <SampleDataContext value={value}>
            <SampleDataBanner />
        </SampleDataContext>
    );
}

describe('SampleDataBanner', () => {
    it('não aparece sem exemplo ativo', () => {
        renderWith(controls({ active: false }));

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('avisa que os dados são de exemplo', () => {
        renderWith(controls());

        expect(screen.getByRole('status')).toHaveTextContent('Você está vendo dados de exemplo. Eles não são seus.');
    });

    it('cancelar a confirmação não chama a API', async () => {
        const user: UserEvent = userEvent.setup();
        const value: SampleDataControls = controls();
        renderWith(value);

        await user.click(screen.getByRole('button', { name: 'Limpar dados de exemplo' }));
        const dialog: HTMLElement = await screen.findByRole('dialog');
        expect(dialog).toHaveTextContent('Os dados que você cadastrou não são afetados.');
        await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

        expect(value.clear).not.toHaveBeenCalled();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('confirmar chama clear e fecha o diálogo', async () => {
        const user: UserEvent = userEvent.setup();
        const value: SampleDataControls = controls();
        renderWith(value);

        await user.click(screen.getByRole('button', { name: 'Limpar dados de exemplo' }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Limpar dados de exemplo' }));

        expect(value.clear).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
