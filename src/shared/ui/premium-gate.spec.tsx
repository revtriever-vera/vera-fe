import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import type { FeatureAccess } from '@/shared/lib/billing/billing-types';
import { billingUsage } from '../../../test/fixtures/billing';
import { renderWithBilling } from '../../../test/render-billing';
import { PremiumGate } from './premium-gate';

function access(state: FeatureAccess): () => FeatureAccess {
    return (): FeatureAccess => state;
}

describe('PremiumGate', () => {
    it('shows the children when the feature is available', async () => {
        renderWithBilling(<PremiumGate feature="ai">função liberada</PremiumGate>);

        expect(await screen.findByText('função liberada')).toBeInTheDocument();
    });

    it('shows the lock line and the link to the plan for the Owner', async () => {
        renderWithBilling(
            <PremiumGate feature="ai" lockText="Disponível no Premium.">
                função liberada
            </PremiumGate>,
            { plan: 'free', featureState: access('premium_required') }
        );

        expect(await screen.findByText('Disponível no Premium.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver o Premium' })).toHaveAttribute('href', '/settings/plan');
        expect(screen.queryByText('função liberada')).not.toBeInTheDocument();
    });

    it('asks a non-Owner to talk to the Owner, with no link', async () => {
        renderWithBilling(<PremiumGate feature="whatsapp">função liberada</PremiumGate>, {
            plan: 'free',
            canManage: false,
            featureState: access('premium_required')
        });

        expect(await screen.findByText('Peça ao Dono da conta')).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('says when the quota comes back, with no buy link', async () => {
        renderWithBilling(<PremiumGate feature="ai">função liberada</PremiumGate>, {
            usage: billingUsage({ state: 'paused', usedBps: 10000, resetsAt: '2026-11-01T12:00:00.000Z' }),
            featureState: access('paused')
        });

        expect(await screen.findByText('Cota do mês esgotada. Volta em 1º de novembro.')).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('says the quota is over when the usage is unknown', async () => {
        renderWithBilling(<PremiumGate feature="ai">função liberada</PremiumGate>, { featureState: access('paused') });

        expect(await screen.findByText('Cota do mês esgotada. Volta na virada do mês.')).toBeInTheDocument();
    });

    it('shows nothing on a disabled feature, or what the caller asks for', async () => {
        renderWithBilling(
            <PremiumGate feature="ai" whenDisabled={<a href="/integracoes">Ver integrações</a>}>
                função liberada
            </PremiumGate>,
            { featureState: access('disabled') }
        );

        expect(await screen.findByRole('link', { name: 'Ver integrações' })).toBeInTheDocument();
        expect(screen.queryByText('função liberada')).not.toBeInTheDocument();
    });

    it('shows nothing on a disabled feature by default', async () => {
        renderWithBilling(
            <>
                <PremiumGate feature="ai">função liberada</PremiumGate>
                <p>depois do portão</p>
            </>,
            { featureState: access('disabled') }
        );

        expect(await screen.findByText('depois do portão')).toBeInTheDocument();
        expect(screen.queryByText('função liberada')).not.toBeInTheDocument();
    });

    it('shows a skeleton while the plan loads', async () => {
        renderWithBilling(<PremiumGate feature="ai">função liberada</PremiumGate>, { isLoading: true, featureState: access('loading') });

        expect(await screen.findByRole('status')).toHaveTextContent('Verificando o seu plano');
        expect(screen.queryByText('função liberada')).not.toBeInTheDocument();
    });
});
