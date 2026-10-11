import { Loader2 } from 'lucide-react';
import { useId, type ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import type { ApiError } from '@/shared/lib/api/api-error';
import { SelectMenu, type SelectChoice } from '@/shared/ui/select-menu';
import { portfolioErrorMessage } from '../../lib/portfolio-error-message';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { Assignment, AssetClassView, HoldingView } from '../../types';
import { useReclassify, type ReclassifyInput } from '../api/use-reclassify.mutation';

export interface ClassSelectCellProps {
    readonly holding: HoldingView;
    readonly classes: readonly AssetClassView[];
}

interface ReclassifyAction {
    readonly pending: boolean;
    readonly change: (classId: string) => void;
}

function useReclassifyAction(holding: HoldingView, classes: readonly AssetClassView[]): ReclassifyAction {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const { t: tp }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const toast: ToastApi = useToast();
    const classLabel: ClassLabel = useClassLabel();
    const mutation: UseMutationResult<Assignment, ApiError, ReclassifyInput> = useReclassify();
    const change = (classId: string): void => {
        if (classId === holding.classId) {
            return;
        }
        mutation.mutate(
            { subjectType: holding.kind, subjectId: holding.id, classId },
            {
                onSuccess: (): void => {
                    track('portfolio_asset_reclassified');
                    const chosen: AssetClassView | undefined = classes.find((item: AssetClassView): boolean => item.id === classId);
                    const className: string = chosen === undefined ? '' : classLabel(chosen.systemKey, chosen.name);
                    toast.show({
                        tone: 'positive',
                        title: t('toasts.reclassified', { symbol: holding.symbol, className }),
                        detail: t('toasts.reclassifiedDetail')
                    });
                },
                onError: (error: Error): void => {
                    toast.show({ tone: 'critical', title: t('toasts.reclassifyFailed'), detail: portfolioErrorMessage(tp, error) });
                }
            }
        );
    };
    return { pending: mutation.isPending, change };
}

export function ClassSelectCell({ holding, classes }: ClassSelectCellProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const classLabel: ClassLabel = useClassLabel();
    const labelId: string = useId();
    const action: ReclassifyAction = useReclassifyAction(holding, classes);
    const choices: readonly SelectChoice[] = classes.map((item: AssetClassView): SelectChoice => ({
        value: item.id,
        label: classLabel(item.systemKey, item.name),
        warning: null
    }));
    return (
        <div className="min-w-0" aria-busy={action.pending}>
            <span id={labelId} className="sr-only">
                {t('classCell.label', { symbol: holding.symbol })}
            </span>
            <SelectMenu
                value={holding.classId ?? ''}
                choices={choices}
                placeholder={t('classCell.none')}
                ariaLabelledBy={labelId}
                disabled={action.pending}
                leading={action.pending ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : undefined}
                showCheck={false}
                onChange={action.change}
            />
        </div>
    );
}
