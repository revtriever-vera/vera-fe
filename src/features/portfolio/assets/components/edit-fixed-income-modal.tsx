import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { Skeleton } from '@/shared/ui/skeleton';
import type { AssetClassView } from '../../types';
import { useFixedIncomeTitle } from '../api/use-fixed-income-title.query';
import { useEditFixedIncomeForm } from '../lib/use-edit-fixed-income-form';
import type { FixedIncomeFormState } from '../lib/use-fixed-income-form';
import type { TitleDetail } from '../types';
import { FixedIncomeDetail } from './fixed-income-detail';
import { FixedIncomeForm } from './fixed-income-form';
import { FixedIncomePreviewPanel } from './fixed-income-preview';

const FORM_ID: string = 'edit-fixed-income-form';

export interface EditFixedIncomeModalProps {
    readonly titleId: string;
    readonly name: string;
    readonly classes: readonly AssetClassView[];
    readonly onClose: () => void;
}

function CancelButton({ onClose }: { readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <Button variant="ghost" onClick={onClose}>
            {t('modal.cancel')}
        </Button>
    );
}

interface LoadedProps {
    readonly title: TitleDetail;
    readonly classes: readonly AssetClassView[];
    readonly onClose: () => void;
}

function EditFooter({ state, onClose }: { readonly state: FixedIncomeFormState; readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <>
            <CancelButton onClose={onClose} />
            <Button type="submit" form={FORM_ID} disabled={!state.canSubmit} loading={state.busy}>
                {state.busy ? t('edit.saving') : t('edit.save')}
            </Button>
        </>
    );
}

function LoadedModal({ title, classes, onClose }: LoadedProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const state: FixedIncomeFormState = useEditFixedIncomeForm({ title, onSaved: onClose });
    return (
        <Modal
            title={t('edit.title', { name: title.name })}
            size="wide"
            fullOnMobile
            onClose={onClose}
            footer={<EditFooter state={state} onClose={onClose} />}
        >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FixedIncomeForm
                    form={state.form}
                    classes={classes}
                    today={state.today}
                    formId={FORM_ID}
                    alertMessage={state.alertMessage}
                    showClass={false}
                    onIndexerChange={state.changeIndexer}
                    onSubmit={(): void => {
                        void state.submit();
                    }}
                />
                <div className="flex min-w-0 flex-col gap-4">
                    <FixedIncomePreviewPanel values={state.values} termsValid={state.termsValid} classes={classes} />
                    <FixedIncomeDetail title={title} />
                </div>
            </div>
        </Modal>
    );
}

export function EditFixedIncomeModal({ titleId, name, classes, onClose }: EditFixedIncomeModalProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const title: UseQueryResult<TitleDetail> = useFixedIncomeTitle(titleId);
    if (title.data !== undefined) {
        return <LoadedModal title={title.data} classes={classes} onClose={onClose} />;
    }
    return (
        <Modal title={t('edit.title', { name })} onClose={onClose} footer={<CancelButton onClose={onClose} />}>
            {title.isError ? <Alert title={t('edit.loadFailed')} /> : <Skeleton className="h-40 w-full" />}
        </Modal>
    );
}
