import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { billingUsage } from '../../../test/fixtures/billing';
import { renderWithBilling } from '../../../test/render-billing';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { BillingBanner } from './billing-banner';

const PAST_DUE: Partial<BillingState> = {
    subscriptionStatus: 'past_due',
    graceEndsAt: '2026-11-08T12:00:00.000Z',
    openInvoice: { id: 'invoice-1', status: 'overdue', totalCents: 1490, dueDate: '2026-11-01' }
};

afterEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
});

describe('BillingBanner', () => {
    it('shows nothing when the usage is ok', async () => {
        const { container } = renderWithBilling(<BillingBanner />, { usage: billingUsage() });

        await Promise.resolve();
        expect(container.querySelector('output')).toBeNull();
    });

    it('warns at 85% and tells what happens at 100%', async () => {
        renderWithBilling(<BillingBanner />, { usage: billingUsage({ usedBps: 8500, state: 'warning' }) });

        expect(await screen.findByText('85% da cota de outubro usada')).toBeInTheDocument();
        expect(screen.getByText(/Em 100%, explicações e WhatsApp pausam até 1º de novembro/)).toBeInTheDocument();
    });

    it('keeps the warning dismissed in the same period', async () => {
        const user: UserEvent = userEvent.setup();
        renderWithBilling(<BillingBanner />, { usage: billingUsage({ usedBps: 8500, state: 'warning' }) });

        await user.click(await screen.findByRole('button', { name: 'Dispensar o aviso' }));

        expect(screen.queryByText('85% da cota de outubro usada')).not.toBeInTheDocument();
        expect(window.sessionStorage.getItem('vera.billing.warning-dismissed')).toBe('2026-11-01T03:00:00.000Z');
    });

    it('shows the warning again in the next period', async () => {
        window.sessionStorage.setItem('vera.billing.warning-dismissed', '2026-10-01T03:00:00.000Z');
        renderWithBilling(<BillingBanner />, { usage: billingUsage({ usedBps: 8500, state: 'warning' }) });

        expect(await screen.findByText('85% da cota de outubro usada')).toBeInTheDocument();
    });

    it('survives a sessionStorage that throws', async () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        const user: UserEvent = userEvent.setup();
        renderWithBilling(<BillingBanner />, { usage: billingUsage({ usedBps: 8500, state: 'warning' }) });

        await user.click(await screen.findByRole('button', { name: 'Dispensar o aviso' }));

        expect(screen.queryByText('85% da cota de outubro usada')).not.toBeInTheDocument();
    });

    it('pins the paused banner, with no dismiss', async () => {
        renderWithBilling(<BillingBanner />, { usage: billingUsage({ usedBps: 10000, state: 'paused' }) });

        expect(await screen.findByText('Pausado até 1º de novembro')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('lets the Owner pay a late invoice', async () => {
        const user: UserEvent = userEvent.setup();
        const { state } = renderWithBilling(<BillingBanner />, PAST_DUE);
        const pay: MockInstance = vi.spyOn(state, 'payInvoice');

        expect(await screen.findByText('Não conseguimos cobrar o Premium.')).toBeInTheDocument();
        expect(screen.getByText(/Ele continua até 8 de novembro/)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Pagar' }));

        expect(pay).toHaveBeenCalledWith('banner');
    });

    it('asks a non-Owner to warn the Owner, with no pay button', async () => {
        renderWithBilling(<BillingBanner />, { ...PAST_DUE, canManage: false });

        expect(await screen.findByText('Avise o Dono da conta.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Pagar' })).not.toBeInTheDocument();
    });

    it('puts the late invoice before the paused quota', async () => {
        renderWithBilling(<BillingBanner />, { ...PAST_DUE, usage: billingUsage({ usedBps: 10000, state: 'paused' }) });

        expect(await screen.findByText('Não conseguimos cobrar o Premium.')).toBeInTheDocument();
        expect(screen.queryByText(/Pausado até/)).not.toBeInTheDocument();
    });

    it('shows nothing on the Free plan nor on a self-hosted install without a cap', async () => {
        const { container } = renderWithBilling(<BillingBanner />, { plan: 'free', usage: billingUsage({ state: 'paused' }) });

        await Promise.resolve();
        expect(container.querySelector('output')).toBeNull();
    });
});
