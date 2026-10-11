import type { ReactElement, ReactNode } from 'react';
import { Globe, Plus, Target, Wallet, Zap } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import { useAssetsStepActions } from '../lib/use-assets-step-actions';
import type { StepActions } from '../lib/use-step-actions';
import { useTrackStepViewed } from '../lib/use-track-step-viewed';
import { StepFooter } from './step-footer';
import { StepLayout } from './step-layout';
import type { WhyItem } from './why-list';

export interface AssetsStepSlots {
    readonly typePicker: ReactNode | null;
    readonly wallet: ReactNode | null;
    readonly assetCount: number;
}

function AssetsComingSoon(): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');

    return (
        <div
            data-testid="assets-step-placeholder"
            className="flex flex-col items-center gap-1.5 rounded-control bg-surface-muted px-4 py-8 text-center"
        >
            <Wallet className="size-6 text-content-muted" aria-hidden="true" />
            <p className="text-sm font-semibold text-content">{t('assetsComingSoonTitle')}</p>
            <p className="max-w-[40ch] text-sm text-content-muted">{t('assetsComingSoonDetail')}</p>
        </div>
    );
}

function AssetsWorkArea({ typePicker, wallet, assetCount }: AssetsStepSlots): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');

    return (
        <div className="grid items-start gap-4 min-[561px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div data-testid="assets-type-picker">{typePicker}</div>
            <aside
                data-testid="assets-wallet"
                aria-labelledby="onboarding-wallet-heading"
                className="rounded-control border border-border bg-surface-muted p-3"
            >
                <h3 id="onboarding-wallet-heading" className="mb-2 text-xs font-bold tracking-[0.07em] text-content-muted uppercase">
                    {t('walletHeading', { count: assetCount })}
                </h3>
                {wallet}
            </aside>
        </div>
    );
}

export function AssetsStep({ typePicker, wallet, assetCount }: AssetsStepSlots): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const actions: StepActions = useAssetsStepActions(assetCount);
    useTrackStepViewed('assets');
    const why: readonly WhyItem[] = [
        { icon: Globe, title: t('assetsWhy1Title'), detail: t('assetsWhy1Detail') },
        { icon: Target, title: t('assetsWhy2Title'), detail: t('assetsWhy2Detail') },
        { icon: Zap, title: t('assetsWhy3Title'), detail: t('assetsWhy3Detail') }
    ];
    const available: boolean = typePicker !== null || wallet !== null;

    return (
        <StepLayout
            current={1}
            title={t('assetsStepTitle')}
            lead={t('assetsStepDescription')}
            why={why}
            noteTitle={t('assetsNoteTitle')}
            noteText={t('assetsNoteText')}
        >
            <Card className="p-5">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-content">
                    <Plus className="size-5 text-accent-strong" aria-hidden="true" />
                    {t('assetsCardTitle')}
                </h2>
                <p className="mt-1 mb-4 text-sm text-content-muted">{t('assetsCardDetail')}</p>
                {available ? <AssetsWorkArea typePicker={typePicker} wallet={wallet} assetCount={assetCount} /> : <AssetsComingSoon />}
                <StepFooter
                    actions={actions}
                    continueLabel={available && assetCount > 0 ? t('assetsContinue', { count: assetCount }) : null}
                />
            </Card>
        </StepLayout>
    );
}
