import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/msw/server';
import { renderWithProviders } from '../../../../test/render';
import { BaseCurrencySwitch } from './base-currency-switch';

describe('BaseCurrencySwitch', () => {
    it('mostra R$ marcado quando a moeda base é BRL', async () => {
        renderWithProviders(<BaseCurrencySwitch />);

        await waitFor(() => {
            expect(screen.getByRole('radio', { name: 'R$' })).toBeEnabled();
        });

        expect(screen.getByRole('radio', { name: 'R$' })).toBeChecked();
        expect(screen.getByRole('radiogroup', { name: 'Moeda base' })).toBeInTheDocument();
    });

    it('fica desabilitado enquanto as preferências carregam', () => {
        renderWithProviders(<BaseCurrencySwitch />);

        expect(screen.getByRole('radio', { name: 'US$' })).toBeDisabled();
    });

    it('troca a moeda chamando PUT e fica ocupado enquanto grava', async () => {
        const user: UserEvent = userEvent.setup();
        const bodies: unknown[] = [];
        let release: () => void = (): void => undefined;
        const gate: Promise<void> = new Promise<void>((resolve): void => {
            release = resolve;
        });
        server.use(
            http.get('*/allocation/settings', () =>
                HttpResponse.json({ baseCurrency: bodies.length > 0 ? 'USD' : 'BRL', toleranceBps: 500 })
            ),
            http.put('*/allocation/settings', async ({ request }) => {
                bodies.push(await request.json());
                await gate;
                return HttpResponse.json({ baseCurrency: 'USD', toleranceBps: 500 });
            })
        );
        renderWithProviders(<BaseCurrencySwitch />);
        await waitFor(() => {
            expect(screen.getByRole('radio', { name: 'US$' })).toBeEnabled();
        });

        await user.click(screen.getByRole('radio', { name: 'US$' }));

        await waitFor(() => {
            expect(screen.getByRole('radiogroup', { name: 'Moeda base' })).toHaveAttribute('aria-busy', 'true');
        });
        expect(screen.getByRole('radio', { name: 'R$' })).toBeDisabled();
        expect(bodies).toEqual([{ baseCurrency: 'USD' }]);

        release();
        await waitFor(() => {
            expect(screen.getByRole('radiogroup', { name: 'Moeda base' })).toHaveAttribute('aria-busy', 'false');
        });
        expect(screen.getByRole('radio', { name: 'US$' })).toBeChecked();
    });

    it('mostra um toast crítico traduzido quando a gravação falha', async () => {
        const user: UserEvent = userEvent.setup();
        server.use(
            http.put('*/allocation/settings', () =>
                HttpResponse.json(
                    { type: 'market-data.exchange_rate_unavailable', title: 'x', status: 503, detail: 'down', requestId: null },
                    { status: 503 }
                )
            )
        );
        renderWithProviders(<BaseCurrencySwitch />);
        await waitFor(() => {
            expect(screen.getByRole('radio', { name: 'US$' })).toBeEnabled();
        });

        await user.click(screen.getByRole('radio', { name: 'US$' }));

        expect(await screen.findByText('Não foi possível trocar a moeda base.')).toBeInTheDocument();
        expect(screen.getByText('O câmbio do dia não está disponível agora.')).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'R$' })).toBeChecked();
    });
});
