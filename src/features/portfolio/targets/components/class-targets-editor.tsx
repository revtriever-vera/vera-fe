import type { BaseSyntheticEvent, ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import type { ApiError } from '@/shared/lib/api/api-error';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { portfolioErrorMessage } from '../../lib/portfolio-error-message';
import { toClassColorKey } from '../../lib/class-color';
import { useSaveAssetTargets } from '../api/use-save-asset-targets.mutation';
import { toAssetFormValues, toAssetTargetsBody, withAutomaticSplit, withEqualSplit } from '../lib/asset-targets-form';
import { useAssetTargetsForm, type AssetTargetsFormState } from '../lib/use-asset-targets-form';
import { useUnsavedGuard, type UnsavedGuard } from '@/shared/lib/use-unsaved-guard';
import type { AssetTargetsFormValues } from '../schemas/asset-targets.schema';
import type { AssetTargetsInput, ClassDetail, SavedAssetTargets } from '../types';
import { AssetTargetsActions } from './asset-targets-actions';
import { AssetTargetsTotalChip } from './asset-targets-total-chip';
import { ClassAssetsTable } from './class-assets-table';

export interface ClassTargetsEditorProps {
    readonly detail: ClassDetail;
}

type SaveMutation = UseMutationResult<SavedAssetTargets, ApiError, AssetTargetsInput>;

function SaveFailure({ error }: { readonly error: Error }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const { t: tp }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    return <Alert title={t('classDetail.saveFailed')} detail={portfolioErrorMessage(tp, error)} />;
}

function UnsavedDialog({ guard }: { readonly guard: UnsavedGuard }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <ConfirmDialog
            title={t('unsaved.title')}
            description={t('unsaved.description')}
            confirmLabel={t('unsaved.leave')}
            destructive
            onConfirm={guard.leave}
            onCancel={guard.stay}
        />
    );
}

function SplitButtons({ state }: { readonly state: AssetTargetsFormState }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const apply = (next: (values: AssetTargetsFormValues) => AssetTargetsFormValues): void => {
        state.replace([...next(state.form.getValues()).targets]);
    };
    return (
        <div className="flex flex-wrap gap-2">
            <Button
                type="button"
                variant="secondary"
                onClick={(): void => {
                    apply(withEqualSplit);
                }}
            >
                {t('classDetail.equalSplit')}
            </Button>
            <Button
                type="button"
                variant="ghost"
                onClick={(): void => {
                    apply(withAutomaticSplit);
                }}
            >
                {t('classDetail.automaticSplit')}
            </Button>
        </div>
    );
}

function useSubmit(state: AssetTargetsFormState, save: SaveMutation): (event?: BaseSyntheticEvent) => Promise<void> {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const toast: ToastApi = useToast();
    return state.form.handleSubmit(async (input: AssetTargetsFormValues): Promise<void> => {
        if (!state.canSave) {
            return;
        }
        try {
            await save.mutateAsync(toAssetTargetsBody(input));
            track('portfolio_asset_targets_saved', { assetCount: input.targets.length });
            toast.show({ tone: 'positive', title: t('classDetail.saved') });
        } catch {
            return;
        }
    });
}

interface FooterProps {
    readonly state: AssetTargetsFormState;
    readonly saving: boolean;
    readonly onDiscard: () => void;
}

function EditorFooter({ state, saving, onDiscard }: FooterProps): ReactElement {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <AssetTargetsTotalChip sumBps={state.sum} />
            <AssetTargetsActions dirty={state.dirty} canSave={state.canSave} saving={saving} onDiscard={onDiscard} />
        </div>
    );
}

export function ClassTargetsEditor({ detail }: ClassTargetsEditorProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const state: AssetTargetsFormState = useAssetTargetsForm(detail);
    const save: SaveMutation = useSaveAssetTargets(detail.class.classId);
    const guard: UnsavedGuard = useUnsavedGuard(state.dirty);
    const submit: (event?: BaseSyntheticEvent) => Promise<void> = useSubmit(state, save);
    const discard = (): void => {
        state.form.reset(toAssetFormValues(detail.assets));
        save.reset();
    };
    return (
        <Card className="flex flex-col gap-4">
            {save.error === null ? null : <SaveFailure error={save.error} />}
            <form
                noValidate
                onSubmit={(event: BaseSyntheticEvent): void => {
                    void submit(event);
                }}
                className="flex flex-col gap-4"
            >
                <SplitButtons state={state} />
                {state.equalSplitHint ? <p className="text-sm text-content-muted">{t('classDetail.equalSplitHint')}</p> : null}
                <ClassAssetsTable
                    assets={detail.assets}
                    fieldIds={state.fields.map((field): string => field.id)}
                    currency={detail.baseCurrency}
                    colorKey={toClassColorKey(detail.class.colorKey)}
                    control={state.form.control}
                />
                <EditorFooter state={state} saving={save.isPending} onDiscard={discard} />
            </form>
            {guard.blocked ? <UnsavedDialog guard={guard} /> : null}
        </Card>
    );
}
