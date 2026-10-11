import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, KeyRound, List, Receipt, Scissors, ShieldCheck } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { track } from '@/shared/lib/analytics';
import { buttonVariants } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { useOnboardingSummary } from '../api/use-onboarding-summary.query';
import { useStepActions, type StepActions } from '../lib/use-step-actions';
import { useTrackStepViewed } from '../lib/use-track-step-viewed';
import { ONBOARDING_PATHS, type AreaSummary } from '../types';
import { ConnectedBanksCard } from './connected-banks-card';
import { PluggySteps } from './pluggy-steps';
import { StepFooter } from './step-footer';
import { StepLayout } from './step-layout';
import type { WhyItem } from './why-list';

export interface BanksStepSlots {
    readonly connectionsLink: string | null;
}

function ConnectionsButton({ link }: { readonly link: string | null }): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const className: string = buttonVariants({ variant: 'secondary' });

    if (link === null) {
        return (
            <span className="flex flex-col items-end gap-1">
                <button
                    type="button"
                    disabled
                    aria-describedby="onboarding-connections-hint"
                    className={cn(className, 'disabled:pointer-events-none disabled:opacity-50')}
                >
                    {t('goToConnections')}
                </button>
                <span id="onboarding-connections-hint" className="text-xs text-content-muted">
                    {t('connectionsUnavailable')}
                </span>
            </span>
        );
    }
    return (
        <Link
            to={link}
            className={className}
            onClick={(): void => {
                track('onboarding_connections_opened');
            }}
        >
            {t('goToConnections')}
            <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
    );
}

function BanksBody({ connected }: { readonly connected: AreaSummary | null }): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');

    if (connected !== null) {
        return <ConnectedBanksCard area={connected} />;
    }
    return (
        <>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-content">
                <KeyRound className="size-5 text-accent-strong" aria-hidden="true" />
                {t('banksCardTitle')}
            </h2>
            <p className="mt-1 mb-4 text-sm text-content-muted">{t('banksCardDetail')}</p>
            <PluggySteps />
        </>
    );
}

export function BanksStep({ connectionsLink }: BanksStepSlots): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const actions: StepActions = useStepActions('banks');
    useTrackStepViewed('banks');
    const summary: ReturnType<typeof useOnboardingSummary> = useOnboardingSummary();
    const connected: AreaSummary | null = summary.data?.banks ?? null;
    const hasBanks: boolean = connected !== null && connected.items > 0;
    const why: readonly WhyItem[] = [
        { icon: Receipt, title: t('banksWhy1Title'), detail: t('banksWhy1Detail') },
        { icon: List, title: t('banksWhy2Title'), detail: t('banksWhy2Detail') },
        { icon: Scissors, title: t('banksWhy3Title'), detail: t('banksWhy3Detail') }
    ];

    return (
        <StepLayout
            current={2}
            title={t('banksStepTitle')}
            lead={t('banksStepDescription')}
            why={why}
            noteIcon={ShieldCheck}
            noteTitle={t('banksNoteTitle')}
            noteText={t('banksNoteText')}
        >
            <Card className="p-5">
                <BanksBody connected={hasBanks ? connected : null} />
                <StepFooter actions={actions} backTo={ONBOARDING_PATHS.assets} continueLabel={hasBanks ? t('continue') : null}>
                    <ConnectionsButton link={connectionsLink} />
                </StepFooter>
            </Card>
        </StepLayout>
    );
}
