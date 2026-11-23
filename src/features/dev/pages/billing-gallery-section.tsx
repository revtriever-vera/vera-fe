import type { ReactElement } from 'react';
import { BillingContext, type BillingState } from '@/shared/lib/billing/billing-context';
import type { BillingUsage, FeatureAccess, PaidFeature } from '@/shared/lib/billing/billing-types';
import { BillingBanner } from '@/shared/ui/billing-banner';
import { PremiumGate } from '@/shared/ui/premium-gate';
import { QuotaMeter } from '@/shared/ui/quota-meter';
import { Section } from './ui-gallery-sections';

const RESETS_AT: string = '2026-11-01T03:00:00.000Z';

function usage(usedBps: number, state: BillingUsage['state']): BillingUsage {
    return {
        usedBps,
        state,
        resetsAt: RESETS_AT,
        byFeature: { ai: { usedBps: Math.round(usedBps * 0.6) }, whatsapp: { usedBps: Math.round(usedBps * 0.4) } },
        capMicros: null
    };
}

function demoState(overrides: Partial<BillingState>, access: FeatureAccess): BillingState {
    return {
        isLoading: false,
        mode: 'hosted',
        plan: 'premium',
        canManage: true,
        usage: null,
        trial: null,
        subscriptionStatus: 'active',
        graceEndsAt: null,
        openInvoice: null,
        featureState: (_feature: PaidFeature): FeatureAccess => access,
        refresh: (): Promise<void> => Promise.resolve(),
        payInvoice: (): Promise<void> => Promise.resolve(),
        ...overrides
    };
}

function Demo({
    label,
    state,
    children
}: {
    readonly label: string;
    readonly state: BillingState;
    readonly children: ReactElement;
}): ReactElement {
    return (
        <BillingContext value={state}>
            <div className="flex w-full flex-col gap-2 rounded-card border border-border p-3">
                <p className="text-xs font-semibold text-content-subtle">{label}</p>
                {children}
            </div>
        </BillingContext>
    );
}

function GateDemos(): ReactElement {
    return (
        <>
            <Demo label="Portão: disponível" state={demoState({}, 'available')}>
                <PremiumGate feature="ai">Função liberada.</PremiumGate>
            </Demo>
            <Demo label="Portão: Premium (Dono)" state={demoState({ plan: 'free' }, 'premium_required')}>
                <PremiumGate
                    feature="ai"
                    lockText="Resumo de setembro. No Premium, a Vera escreve aqui um resumo destes números em 3 ou 4 frases."
                >
                    Função liberada.
                </PremiumGate>
            </Demo>
            <Demo label="Portão: Premium (não Dono)" state={demoState({ plan: 'free', canManage: false }, 'premium_required')}>
                <PremiumGate feature="whatsapp">Função liberada.</PremiumGate>
            </Demo>
            <Demo label="Portão: cota esgotada" state={demoState({ usage: usage(10000, 'paused') }, 'paused')}>
                <PremiumGate feature="ai">Função liberada.</PremiumGate>
            </Demo>
            <Demo label="Portão: carregando" state={demoState({ isLoading: true }, 'loading')}>
                <PremiumGate feature="ai">Função liberada.</PremiumGate>
            </Demo>
        </>
    );
}

function MeterDemos(): ReactElement {
    return (
        <>
            <Demo label="Medidor: normal" state={demoState({}, 'available')}>
                <QuotaMeter usage={usage(3400, 'ok')} />
            </Demo>
            <Demo label="Medidor: perto do limite" state={demoState({}, 'available')}>
                <QuotaMeter usage={usage(8500, 'warning')} />
            </Demo>
            <Demo label="Medidor: pausado, variante completa" state={demoState({}, 'available')}>
                <QuotaMeter usage={usage(10000, 'paused')} full />
            </Demo>
        </>
    );
}

function TrialBannerDemo(): ReactElement {
    return (
        <Demo
            label="Faixa: teste acaba em 3 dias"
            state={demoState(
                { subscriptionStatus: null, trial: { kind: 'no_card', endsAt: '2026-12-01T12:00:00.000Z', daysLeft: 3 } },
                'available'
            )}
        >
            <BillingBanner />
        </Demo>
    );
}

function BannerDemos(): ReactElement {
    return (
        <>
            <TrialBannerDemo />
            <Demo label="Faixa: 85%" state={demoState({ usage: usage(8500, 'warning') }, 'available')}>
                <BillingBanner />
            </Demo>
            <Demo label="Faixa: pausado" state={demoState({ usage: usage(10000, 'paused') }, 'paused')}>
                <BillingBanner />
            </Demo>
            <Demo
                label="Faixa: fatura atrasada (Dono)"
                state={demoState(
                    {
                        subscriptionStatus: 'past_due',
                        graceEndsAt: '2026-11-08T03:00:00.000Z',
                        openInvoice: { id: 'invoice-1', status: 'overdue', totalCents: 1490, dueDate: '2026-11-01' }
                    },
                    'available'
                )}
            >
                <BillingBanner />
            </Demo>
            <Demo
                label="Faixa: fatura atrasada (não Dono)"
                state={demoState(
                    { subscriptionStatus: 'past_due', graceEndsAt: '2026-11-08T03:00:00.000Z', canManage: false },
                    'available'
                )}
            >
                <BillingBanner />
            </Demo>
        </>
    );
}

export function BillingSection(): ReactElement {
    return (
        <Section title="Plano e cota">
            <GateDemos />
            <MeterDemos />
            <BannerDemos />
        </Section>
    );
}
