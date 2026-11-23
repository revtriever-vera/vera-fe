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

const BPS_BASE: number = 10000;

function isCapped(cuts: CutsResponse, bps: number): boolean {
    return cuts.objectives.monthlyNeededMinor * BPS_BASE > bps * cuts.incomeMinor;
}

function useAdoptGoal(
    draft: GoalDraftControls,
    capped: boolean
): { readonly adopt: (bps: number) => Promise<void>; readonly pending: boolean } {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const { t: tSpending }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const locale: SupportedLocale = useLocale();
    const toast: ToastApi = useToast();
    const update: UseMutationResult<SpendingSettings, ApiError, UpdateSpendingSettings> = useUpdateSpendingSettings();
    const adopt = async (bps: number): Promise<void> => {
        try {
            await update.mutateAsync({ savingsGoalBps: bps });
            draft.reset();
            track('spending_goal_from_objectives');
            toast.show({
                tone: 'positive',
                title: capped ? t('objectives.savedCapped', { rate: formatRateBps(bps, locale) }) : t('objectives.saved')
            });
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
    const bps: number | null = cuts.objectives.asGoalBps;
    const capped: boolean = bps !== null && isCapped(cuts, bps);
    const { adopt, pending } = useAdoptGoal(draft, capped);
    if (!canEdit || bps === null || bps === draft.savedBps) {
        return null;
    }
    const label: string = capped
        ? t('objectives.adoptCapped', {
              amount: formatWhole(Math.round((cuts.incomeMinor * bps) / BPS_BASE), locale),
              rate: formatRateBps(bps, locale)
          })
        : t('objectives.adopt', { amount: formatWhole(cuts.objectives.monthlyNeededMinor, locale) });
    return (
        <Button
            loading={pending}
            onClick={(): void => {
                void adopt(bps);
            }}
        >
            {label}
        </Button>
    );
}

function CappedNotice({ cuts }: { readonly cuts: CutsResponse }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const locale: SupportedLocale = useLocale();
    const bps: number | null = cuts.objectives.asGoalBps;
    if (bps === null || !isCapped(cuts, bps)) {
        return null;
    }
    return <p className="text-sm font-medium text-caution">{t('objectives.exceedsIncome', { rate: formatRateBps(bps, locale) })}</p>;
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
                <CappedNotice cuts={cuts} />
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
