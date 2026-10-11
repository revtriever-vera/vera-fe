import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { Recategorized } from '../../types';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import type { RuleView } from '../../types';
import { useDeleteRule } from '../api/use-delete-rule.mutation';
import { recategorizedToast } from '../lib/recategorized-toast';
import { ruleLabel } from '../lib/rule-labels';

export interface DeleteRuleDialogProps {
    readonly rule: RuleView;
    readonly onClose: () => void;
}

export function DeleteRuleDialog({ rule, onClose }: DeleteRuleDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const remove: UseMutationResult<Recategorized, ApiError, string> = useDeleteRule();
    const confirm = (): void => {
        remove.mutate(rule.id, {
            onSuccess: (result): void => {
                track('spending_rule_deleted');
                toast.show({ tone: 'positive', title: recategorizedToast(t, 'ruleDeleted', result.recategorized) });
                onClose();
            },
            onError: (error: Error): void => {
                toast.show({ tone: 'critical', title: t('toasts.ruleDeleteFailed'), detail: spendingErrorMessage(ts, error) });
                onClose();
            }
        });
    };
    return (
        <ConfirmDialog
            title={t('deleteRule.title', { label: ruleLabel(t, rule) })}
            description={t('deleteRule.description')}
            confirmLabel={t('deleteRule.confirm')}
            destructive
            pending={remove.isPending}
            onConfirm={confirm}
            onCancel={onClose}
        />
    );
}
