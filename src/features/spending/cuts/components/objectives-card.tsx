import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import { track } from '@/shared/lib/analytics';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button, buttonVariants } from '@/shared/ui/button';
import { useUpdateSpendingSettings } from '../../api/use-spending-settings.mutation';
import { formatRateBps } from '../../lib/format-bps';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import type { CutsResponse, SpendingSettings, UpdateSpendingSettings } from '../../types';
import { formatWhole } from '../lib/format-reais';
import type { GoalDraftControls } from '../lib/goal-draft';

export interface ObjectivesCardProps {
    readonly cuts: CutsResponse;
    readonly draft: GoalDraftControls;
}

function useAdoptGoal(draft: GoalDraftControls): { readonly adopt: (bps: number) => Promise<void>; readonly pending: boolean } {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const { t: tSpending }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const update: UseMutationResult<SpendingSettings, ApiError, UpdateSpendingSettings> = useUpdateSpendingSettings();
    const adopt = async (bps: number): Promise<void> => {
        try {
            await update.mutateAsync({ savingsGoalBps: bps });
            draft.reset();
            track('spending_goal_from_objectives');
            toast.show({ tone: 'positive', title: t('objectives.saved') });
        } catch (error) {
            toast.show({ tone: 'critical', title: spendingErrorMessage(tSpending, error instanceof Error ? error : null) });
        }
    };
    return { adopt, pending: update.isPending };
}

function AdoptButton({ cuts, draft }: ObjectivesCardProps): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const locale: SupportedLocale = useLocale();
    const { canEdit } = useRole();
    const { adopt, pending } = useAdoptGoal(draft);
    const bps: number | null = cuts.objectives.asGoalBps;
    if (!canEdit || bps === null || bps === draft.savedBps) {
        return null;
    }
    return (
        <Button
            loading={pending}
            onClick={(): void => {
                void adopt(bps);
            }}
        >
            {t('objectives.adopt', { amount: formatWhole(cuts.objectives.monthlyNeededMinor, locale) })}
        </Button>
    );
}

export function ObjectivesCard({ cuts, draft }: ObjectivesCardProps): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const locale: SupportedLocale = useLocale();
    const { monthlyNeededMinor, behindCount } = cuts.objectives;
    if (monthlyNeededMinor <= 0) {
        return null;
    }
    const needed: string = formatWhole(monthlyNeededMinor, locale);
    return (
        <section aria-labelledby="objectives-card-title" className="surface-card flex flex-col gap-3 p-5">
            <div className="flex flex-col gap-1">
                <h2 id="objectives-card-title" className="text-lg font-bold">
                    {t('objectives.title', { amount: needed })}
                </h2>
                <p className="text-sm text-content-muted">
                    {cuts.status === 'no_income'
                        ? t('objectives.noIncome')
                        : t('objectives.goalLine', {
                              rate: formatRateBps(cuts.goal.bps, locale),
                              amount: formatWhole(cuts.goal.minor, locale)
                          })}
                </p>
                {behindCount > 0 ? (
                    <p className="text-sm font-medium text-caution">{t('objectives.behind', { count: behindCount })}</p>
                ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <AdoptButton cuts={cuts} draft={draft} />
                <Link to="/portfolio/goals" className={buttonVariants({ variant: 'secondary' })}>
                    {t('objectives.view')}
                </Link>
            </div>
        </section>
    );
}
