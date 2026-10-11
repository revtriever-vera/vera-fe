import { ArrowLeft } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { IconTile } from '@/shared/ui/icon-tile';
import { Modal } from '@/shared/ui/modal';
import { CLASS_TILE_TONES } from '../../components/class-tile';
import type { ClassColorKey } from '../../types';
import { ASSET_TYPE_SPECS, type AddAssetType } from '../lib/asset-types';

export interface SubmitState {
    readonly formId: string;
    readonly disabled: boolean;
    readonly busy: boolean;
}

export interface DetailsFrameProps {
    readonly type: AddAssetType;
    readonly colorKey: ClassColorKey;
    readonly submit: SubmitState | null;
    readonly left: ReactNode;
    readonly right: ReactNode;
    readonly onBack: () => void;
    readonly onClose: () => void;
}

function BackButton({ onBack }: { readonly onBack: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <button
            type="button"
            aria-label={t('modal.back')}
            onClick={onBack}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-control text-accent-strong transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none"
        >
            <ArrowLeft className="size-4" aria-hidden="true" />
        </button>
    );
}

function Footer({ submit, onClose }: { readonly submit: SubmitState | null; readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <>
            <Button variant="ghost" onClick={onClose}>
                {t('modal.cancel')}
            </Button>
            {submit === null ? null : (
                <Button type="submit" form={submit.formId} disabled={submit.disabled} loading={submit.busy}>
                    {submit.busy ? t('modal.adding') : t('modal.add')}
                </Button>
            )}
        </>
    );
}

export function DetailsFrame({ type, colorKey, submit, left, right, onBack, onClose }: DetailsFrameProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <Modal
            title={t(`types.${type}.name`)}
            size="wide"
            fullOnMobile
            onClose={onClose}
            leading={
                <>
                    <BackButton onBack={onBack} />
                    <IconTile icon={ASSET_TYPE_SPECS[type].icon} tone="neutral" size="sm" className={CLASS_TILE_TONES[colorKey]} />
                </>
            }
            footer={<Footer submit={submit} onClose={onClose} />}
        >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="min-w-0">{left}</div>
                <div className="min-w-0">{right}</div>
            </div>
        </Modal>
    );
}
