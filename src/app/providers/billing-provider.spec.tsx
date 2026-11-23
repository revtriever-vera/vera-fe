import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { apiClient } from '@/shared/lib/api/client';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import type { BillingUsage } from '@/shared/lib/billing/billing-types';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { billingMe, billingUsage, freeBilling } from '../../../test/fixtures/billing';
import { server } from '../../../test/msw/server';
import { BillingProvider } from './billing-provider';
import { ToastProvider } from './toast-provider';

interface FakeTab {
    opener: unknown;
    location: { href: string };
    close: ReturnType<typeof vi.fn>;
}

function Probe(): ReactElement {
    const billing: BillingState = useBilling();
    return (
        <div>
            <p>{`plano ${billing.plan} ${billing.isLoading ? 'carregando' : 'pronto'}`}</p>
            <p>{`ai ${billing.featureState('ai')}`}</p>
            <button
                type="button"
                onClick={(): void => {
                    void billing.payInvoice('banner');
                }}
            >
                pagar
            </button>
        </div>
    );
}

function setup(): QueryClient {
    const client: QueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
        <QueryClientProvider client={client}>
            <ToastProvider>
                <BillingProvider>{children}</BillingProvider>
            </ToastProvider>
        </QueryClientProvider>
    );
    render(<Probe />, { wrapper });
    return client;
}

describe('BillingProvider', () => {
    it('reads the plan and the state of each feature from /billing/me', async () => {
        server.use(http.get('*/billing/me', () => HttpResponse.json(freeBilling())));
        setup();

        expect(screen.getByText('plano free carregando')).toBeInTheDocument();
        expect(await screen.findByText('plano free pronto')).toBeInTheDocument();
        expect(screen.getByText('ai premium_required')).toBeInTheDocument();
    });

    it('lets the features through when the plan cannot be read', async () => {
        server.use(http.get('*/billing/me', () => HttpResponse.json({ type: 'x', title: 'x', status: 400, detail: 'x' }, { status: 400 })));
        setup();

        expect(await screen.findByText('ai available')).toBeInTheDocument();
    });

    it('asks again when any call comes back 402 premium_required or 429 cap_reached', async () => {
        let calls: number = 0;
        server.use(
            http.get('*/billing/me', () => {
                calls += 1;
                return HttpResponse.json(billingMe());
            }),
            http.get('*/health', () =>
                HttpResponse.json(
                    { type: 'billing.premium_required', title: 'x', status: 402, detail: 'x', requestId: null },
                    { status: 402 }
                )
            )
        );
        setup();
        await screen.findByText('plano premium pronto');

        await act(async (): Promise<void> => {
            await apiClient.GET('/health');
        });

        await waitFor((): void => {
            expect(calls).toBe(2);
        });
    });

    it('toasts once when the usage goes from ok to warning, and again at paused', async () => {
        let usage: BillingUsage = billingUsage();
        server.use(http.get('*/billing/me', () => HttpResponse.json(billingMe({ usage }))));
        const client: QueryClient = setup();
        await screen.findByText('plano premium pronto');
        expect(screen.queryByText(/Você já usou/)).not.toBeInTheDocument();

        usage = billingUsage({ usedBps: 8500, state: 'warning' });
        await act(async (): Promise<void> => client.invalidateQueries());
        expect(await screen.findByText('Você já usou 85% da cota do mês')).toBeInTheDocument();
        await act(async (): Promise<void> => client.invalidateQueries());
        expect(screen.getAllByText('Você já usou 85% da cota do mês')).toHaveLength(1);

        usage = billingUsage({ usedBps: 10000, state: 'paused' });
        await act(async (): Promise<void> => client.invalidateQueries());
        expect(await screen.findByText('Cota esgotada: explicações e WhatsApp pausados até 1º de novembro')).toBeInTheDocument();
    });

    it('opens the payment tab on click with the link of the open invoice', async () => {
        const tab: FakeTab = { opener: 'app', location: { href: '' }, close: vi.fn() };
        vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
        server.use(
            http.get('*/billing/me', () =>
                HttpResponse.json(billingMe({ openInvoice: { id: 'inv-9', status: 'issued', totalCents: 1490, dueDate: '2026-11-01' } }))
            ),
            http.get('*/billing/invoices/inv-9/payment-link', () =>
                HttpResponse.json({ url: 'https://pay.example/inv-9', kind: 'gateway' })
            )
        );
        const user: UserEvent = userEvent.setup();
        setup();
        await screen.findByText('plano premium pronto');
        await waitFor((): void => {
            expect(screen.getByRole('button', { name: 'pagar' })).toBeEnabled();
        });

        await user.click(screen.getByRole('button', { name: 'pagar' }));

        await waitFor((): void => {
            expect(tab.location.href).toBe('https://pay.example/inv-9');
        });
    });

    it('toasts when the payment link cannot be loaded and closes the tab', async () => {
        const tab: FakeTab = { opener: 'app', location: { href: '' }, close: vi.fn() };
        vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
        server.use(
            http.get('*/billing/me', () =>
                HttpResponse.json(billingMe({ openInvoice: { id: 'inv-9', status: 'issued', totalCents: 1490, dueDate: '2026-11-01' } }))
            ),
            http.get('*/billing/invoices/inv-9/payment-link', () =>
                HttpResponse.json(
                    { type: 'billing.invoice_not_found', title: 'x', status: 404, detail: 'x', requestId: null },
                    { status: 404 }
                )
            )
        );
        const user: UserEvent = userEvent.setup();
        setup();
        await screen.findByText('plano premium pronto');

        await user.click(screen.getByRole('button', { name: 'pagar' }));

        expect(await screen.findByText('Não foi possível abrir a página de pagamento. Tente de novo.')).toBeInTheDocument();
        expect(tab.close).toHaveBeenCalled();
    });
});
