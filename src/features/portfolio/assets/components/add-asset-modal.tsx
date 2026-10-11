import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { Skeleton } from '@/shared/ui/skeleton';
import { useClasses } from '../../api/use-classes.query';
import type { AssetClassView, ClassesResponse } from '../../types';
import type { AddAssetType } from '../lib/asset-types';
import { useAddAssetFlow, type AddAssetFlow } from '../lib/use-add-asset-flow';
import { AssetTypeCards } from './asset-type-cards';
import { FixedIncomeStep } from './fixed-income-step';
import { PositionStep } from './position-step';

export interface AddAssetModalProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly initialType?: AddAssetType;
    readonly initialClassId?: string;
}

interface DialogProps {
    readonly onClose: () => void;
    readonly initialType: AddAssetType | undefined;
    readonly initialClassId: string | undefined;
}

function TypeStep({ flow, onClose }: { readonly flow: AddAssetFlow; readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <Modal
            title={t('modal.title')}
            description={t('modal.description')}
            onClose={onClose}
            footer={
                <Button variant="ghost" onClick={onClose}>
                    {t('modal.cancel')}
                </Button>
            }
        >
            <AssetTypeCards onSelect={flow.selectType} focusType={flow.lastType} />
        </Modal>
    );
}

function WaitingStep({ failed, onClose }: { readonly failed: boolean; readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const { t: tp }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    return (
        <Modal
            title={t('modal.title')}
            onClose={onClose}
            footer={
                <Button variant="ghost" onClick={onClose}>
                    {t('modal.cancel')}
                </Button>
            }
        >
            {failed ? <Alert title={tp('errors.generic')} /> : <Skeleton className="h-40 w-full" />}
        </Modal>
    );
}

function AddAssetDialog({ onClose, initialType, initialClassId }: DialogProps): ReactElement {
    const flow: AddAssetFlow = useAddAssetFlow(initialType);
    const classes: UseQueryResult<ClassesResponse> = useClasses();
    const available: readonly AssetClassView[] | undefined = classes.data?.data;
    if (flow.type === null) {
        return <TypeStep flow={flow} onClose={onClose} />;
    }
    if (available === undefined) {
        return <WaitingStep failed={classes.isError} onClose={onClose} />;
    }
    if (flow.type === 'fixed_income') {
        return <FixedIncomeStep classes={available} initialClassId={initialClassId} onBack={flow.goBack} onClose={onClose} />;
    }
    return (
        <PositionStep
            type={flow.type}
            flow={flow}
            classes={available}
            initialClassId={initialClassId}
            onBack={flow.goBack}
            onClose={onClose}
        />
    );
}

export function AddAssetModal({ open, onOpenChange, initialType, initialClassId }: AddAssetModalProps): ReactElement | null {
    if (!open) {
        return null;
    }
    return (
        <AddAssetDialog
            initialType={initialType}
            initialClassId={initialClassId}
            onClose={(): void => {
                onOpenChange(false);
            }}
        />
    );
}
