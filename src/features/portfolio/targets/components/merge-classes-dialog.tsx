import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Modal } from '@/shared/ui/modal';
import { SelectMenu, type SelectChoice } from '@/shared/ui/select-menu';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useMergeClasses, type MergeClassesInput } from '../api/use-merge-classes.mutation';
import { formatTargetBps } from '../../lib/format-bps';
import { portfolioErrorMessage } from '../../lib/portfolio-error-message';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { AssetClassView } from '../../types';
import { mergeSummary, type MergeSummary } from '../lib/merge-summary';

export interface MergeClassesDialogProps {
    readonly source: AssetClassView;
    readonly classes: readonly AssetClassView[];
    readonly sourceHoldings: number;
    readonly onClose: () => void;
}

const DESTINATION_LABEL_ID: string = 'merge-destination-label';

interface MergeAction {
    readonly run: (destination: AssetClassView) => Promise<void>;
    readonly pending: boolean;
}

function useMergeAction(
    source: AssetClassView,
    onClose: () => void
): { readonly run: (destination: AssetClassView) => Promise<void>; readonly pending: boolean } {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const { t: tp }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const label: ClassLabel = useClassLabel();
    const toast: ToastApi = useToast();
    const merge: UseMutationResult<AssetClassView, ApiError, MergeClassesInput> = useMergeClasses();
    const run = async (destination: AssetClassView): Promise<void> => {
        try {
            await merge.mutateAsync({ id: source.id, intoClassId: destination.id });
            const names: { source: string; destination: string } = {
                source: label(source.systemKey, source.name),
                destination: label(destination.systemKey, destination.name)
            };
            toast.show({ tone: 'positive', title: t('classes.toasts.merged', names) });
        } catch (error) {
            toast.show({ tone: 'critical', title: t('classes.toasts.mergeFailed'), detail: portfolioErrorMessage(tp, error as Error) });
        }
        onClose();
    };
    return { run, pending: merge.isPending };
}

interface ConfirmProps {
    readonly source: AssetClassView;
    readonly destination: AssetClassView;
    readonly sourceHoldings: number;
    readonly onClose: () => void;
}

function MergeConfirm({ source, destination, sourceHoldings, onClose }: ConfirmProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const locale: SupportedLocale = useLocale();
    const label: ClassLabel = useClassLabel();
    const action: MergeAction = useMergeAction(source, onClose);
    const summary: MergeSummary = mergeSummary(source, destination, sourceHoldings);
    const names: { source: string; destination: string } = {
        source: label(source.systemKey, source.name),
        destination: label(destination.systemKey, destination.name)
    };
    return (
        <ConfirmDialog
            title={t('classes.merge.confirmTitle', names)}
            description={t('classes.merge.confirmDescription', {
                ...names,
                count: summary.movedCount,
                sourceTarget: formatTargetBps(summary.sourceTargetBps, locale),
                destinationTarget: formatTargetBps(summary.destinationTargetBps, locale),
                sum: formatTargetBps(summary.sumBps, locale)
            })}
            confirmLabel={t('classes.merge.confirm')}
            pending={action.pending}
            onConfirm={(): void => {
                void action.run(destination);
            }}
            onCancel={onClose}
        />
    );
}

interface PickerProps {
    readonly source: AssetClassView;
    readonly classes: readonly AssetClassView[];
    readonly destinationId: string;
    readonly onPick: (id: string) => void;
    readonly onContinue: () => void;
    readonly onClose: () => void;
}

function DestinationPicker({ source, classes, destinationId, onPick, onContinue, onClose }: PickerProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const label: ClassLabel = useClassLabel();
    const choices: readonly SelectChoice[] = classes
        .filter((item: AssetClassView): boolean => item.id !== source.id)
        .map((item: AssetClassView): SelectChoice => ({ value: item.id, label: label(item.systemKey, item.name), warning: null }));
    return (
        <Modal
            title={t('classes.merge.title', { name: label(source.systemKey, source.name) })}
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        {t('classes.merge.cancel')}
                    </Button>
                    <Button disabled={destinationId === ''} onClick={onContinue}>
                        {t('classes.merge.continue')}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-1.5">
                <span id={DESTINATION_LABEL_ID} className="text-sm font-medium text-content">
                    {t('classes.merge.destinationLabel')}
                </span>
                <SelectMenu
                    value={destinationId}
                    choices={choices}
                    placeholder={t('classes.merge.destinationPlaceholder')}
                    ariaLabelledBy={DESTINATION_LABEL_ID}
                    onChange={onPick}
                />
            </div>
        </Modal>
    );
}

export function MergeClassesDialog({ source, classes, sourceHoldings, onClose }: MergeClassesDialogProps): ReactElement {
    const [destinationId, setDestinationId] = useState<string>('');
    const [confirming, setConfirming] = useState<boolean>(false);
    const destination: AssetClassView | undefined = classes.find((item: AssetClassView): boolean => item.id === destinationId);
    if (confirming && destination !== undefined) {
        return <MergeConfirm source={source} destination={destination} sourceHoldings={sourceHoldings} onClose={onClose} />;
    }
    return (
        <DestinationPicker
            source={source}
            classes={classes}
            destinationId={destinationId}
            onPick={setDestinationId}
            onContinue={(): void => {
                setConfirming(true);
            }}
            onClose={onClose}
        />
    );
}
