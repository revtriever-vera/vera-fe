import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { RuleResult } from '../../types';
import type { UpdateRuleInput } from '../api/use-update-rule.mutation';
import type { ReactElement } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { cn } from '@/shared/lib/cn';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { CategoryPicker } from '../../components/category-picker';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import type { RuleView } from '../../types';
import { useUpdateRule } from '../api/use-update-rule.mutation';
import { recategorizedToast } from '../lib/recategorized-toast';
import { pickerDirection, ruleAppliesToLabel, ruleDomId, ruleLabel, ruleTypeLabel } from '../lib/rule-labels';

export interface RuleActionProps {
    readonly rule: RuleView;
    readonly onDelete: (rule: RuleView) => void;
}

const ICON_BUTTON: string =
    'inline-flex size-8 items-center justify-center rounded-control text-content-muted transition-colors hover:bg-surface-muted hover:text-critical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

export const HIGHLIGHT_CLASS: string = 'bg-accent-soft ring-2 ring-accent';

export function RuleName({ rule }: { readonly rule: RuleView }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    return (
        <span id={ruleDomId(rule.id)} className="font-medium break-words text-content">
            {ruleLabel(t, rule)}
        </span>
    );
}

export function RuleCategoryCell({ rule }: { readonly rule: RuleView }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const update: UseMutationResult<RuleResult, ApiError, UpdateRuleInput> = useUpdateRule();
    const change = (id: string | null): void => {
        if (id === null || id === rule.categoryId) {
            return;
        }
        update.mutate(
            { id: rule.id, body: { categoryId: id } },
            {
                onSuccess: (result): void => {
                    toast.show({ tone: 'positive', title: recategorizedToast(t, 'ruleUpdated', result.recategorized) });
                },
                onError: (error: Error): void => {
                    toast.show({ tone: 'critical', title: t('toasts.ruleUpdateFailed'), detail: spendingErrorMessage(ts, error) });
                }
            }
        );
    };
    return (
        <div className="min-w-48">
            <CategoryPicker
                label={t('rules.categoryLabel', { label: ruleLabel(t, rule) })}
                value={rule.categoryId}
                onChange={change}
                direction={pickerDirection(rule.appliesTo)}
            />
        </div>
    );
}

export function RuleDeleteButton({ rule, onDelete }: RuleActionProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    return (
        <button
            type="button"
            aria-label={t('rules.delete', { label: ruleLabel(t, rule) })}
            className={ICON_BUTTON}
            onClick={(): void => {
                onDelete(rule);
            }}
        >
            <Trash2 className="size-4" aria-hidden="true" />
        </button>
    );
}

export function RuleCard({ rule, onDelete, highlighted }: RuleActionProps & { readonly highlighted: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const locale: SupportedLocale = useLocale();
    return (
        <li className={cn('surface-card flex flex-col gap-3 p-4', highlighted && HIGHLIGHT_CLASS)}>
            <div className="flex items-start justify-between gap-2">
                <RuleName rule={rule} />
                <RuleDeleteButton rule={rule} onDelete={onDelete} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Badge>{ruleTypeLabel(t, rule.matchType)}</Badge>
                <Badge>{ruleAppliesToLabel(t, rule.appliesTo)}</Badge>
                <span className="text-xs text-content-subtle">{t('rules.createdOn', { date: formatIsoDate(rule.createdAt, locale) })}</span>
            </div>
            <RuleCategoryCell rule={rule} />
        </li>
    );
}
