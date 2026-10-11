import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { ApiError } from '@/shared/lib/api/api-error';
import { track } from '@/shared/lib/analytics';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { useUpdateSpendingSettings } from '../../api/use-spending-settings.mutation';
import { formatRateBps } from '../../lib/format-bps';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import type { CutsResponse, SpendingSettings, UpdateSpendingSettings } from '../../types';
import { formatWhole } from '../lib/format-reais';
import type { GoalDraftControls } from '../lib/goal-draft';
import { GoalSlider } from './goal-slider';

export interface GoalCardProps {
    readonly cuts: CutsResponse;
    readonly draft: GoalDraftControls;
}

function GoalPills({ cuts }: { readonly cuts: CutsResponse }): ReactElement {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const locale: SupportedLocale = useLocale();
    const saved: string = formatWhole(cuts.savedMinor, locale);
    return (
        <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">{t('goal.goalPill', { amount: formatWhole(cuts.goal.minor, locale) })}</Badge>
            <Badge tone={cuts.savedMinor >= cuts.goal.minor ? 'positive' : 'caution'}>
                {cuts.savingsRateBps === null
                    ? t('goal.savedPillNoRate', { amount: saved })
                    : t('goal.savedPill', { amount: saved, rate: formatRateBps(cuts.savingsRateBps, locale) })}
            </Badge>
        </div>
    );
}

function useSaveGoal(draft: GoalDraftControls): { readonly save: () => Promise<void>; readonly pending: boolean } {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const { t: tSpending }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const update: UseMutationResult<SpendingSettings, ApiError, UpdateSpendingSettings> = useUpdateSpendingSettings();
    const save = async (): Promise<void> => {
        try {
            await update.mutateAsync({ savingsGoalBps: draft.draftBps });
            draft.reset();
            track('spending_goal_saved');
            toast.show({ tone: 'positive', title: t('goal.saved') });
        } catch (error) {
            toast.show({ tone: 'critical', title: spendingErrorMessage(tSpending, error instanceof Error ? error : null) });
        }
    };
    return { save, pending: update.isPending };
}

export function GoalCard({ cuts, draft }: GoalCardProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const { save, pending } = useSaveGoal(draft);
    return (
        <section aria-labelledby="goal-card-title" className="surface-card flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="goal-card-title" className="text-lg font-bold">
                    {t('goal.title')}
                </h2>
                <GoalPills cuts={cuts} />
            </div>
            <GoalSlider valueBps={draft.draftBps} onChange={draft.set} />
            {draft.dirty ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-content-muted">{t('goal.simulating')}</p>
                    <Button
                        loading={pending}
                        onClick={(): void => {
                            void save();
                        }}
                    >
                        {t('goal.save')}
                    </Button>
                </div>
            ) : null}
        </section>
    );
}
