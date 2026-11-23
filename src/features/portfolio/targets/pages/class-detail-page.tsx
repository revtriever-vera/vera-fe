import { RoleGate } from '@/app/providers/role-gate';
import { useRole } from '@/app/providers/use-role';
import { ReadOnlyClassAssets } from '../components/read-only-class-assets';
import { useState, type ReactElement } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { AddAssetModal } from '../../assets/components/add-asset-modal';
import { useClassDetail } from '../api/use-class-detail.query';
import { ClassHeader } from '../components/class-header';
import { ClassTargetsEditor } from '../components/class-targets-editor';
import { ZeroQuantityNote } from '../components/zero-quantity-note';
import { HolderFilter } from '../../components/holder-filter';
import type { HolderParam } from '../../lib/holder-filter';
import { useHolderParam } from '../../lib/use-holder-param';
import type { ClassDetail } from '../types';

const CLASS_NOT_FOUND: string = 'allocation.class_not_found';

function DetailLoading(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <Loading label={t('classDetail.loading')} className="flex flex-col gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-80 w-full" />
        </Loading>
    );
}

function DetailFailure({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <div className="flex flex-col items-start gap-3">
            <FailureAlert error={error} title={t('classDetail.loadError')} />
            <Button variant="secondary" onClick={onRetry}>
                {t('classDetail.retry')}
            </Button>
        </div>
    );
}

function NotFound(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <EmptyState
            title={t('classDetail.notFound.title')}
            description={t('classDetail.notFound.description')}
            action={
                <Link to="/portfolio" className="text-sm font-semibold text-accent-strong underline-offset-2 hover:underline">
                    {t('classDetail.notFound.action')}
                </Link>
            }
        />
    );
}

function EmptyClass({ onAdd }: { readonly onAdd: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const { canEdit } = useRole();
    if (!canEdit) {
        return <EmptyState title={t('classDetail.emptyTitle')} description={t('classDetail.zeroNote')} />;
    }
    return (
        <EmptyState
            title={t('classDetail.emptyTitle')}
            description={t('classDetail.zeroNote')}
            action={<Button onClick={onAdd}>{t('classDetail.emptyAction')}</Button>}
        />
    );
}

function ClassEditor({ detail, canEdit }: { readonly detail: ClassDetail; readonly canEdit: boolean }): ReactElement {
    return canEdit ? <ClassTargetsEditor detail={detail} /> : <ReadOnlyClassAssets detail={detail} />;
}

function DetailContent({ detail }: { readonly detail: ClassDetail }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const [adding, setAdding] = useState<boolean>(false);
    const open = (): void => {
        setAdding(true);
    };
    const { canEdit } = useRole();
    const empty: boolean = detail.assets.length === 0;
    const unbalanced: boolean = detail.targetsSumBps !== 0 && detail.targetsSumBps !== 10000;
    return (
        <section className="flex flex-col gap-4">
            <ClassHeader detail={detail} />
            {unbalanced ? <Alert tone="caution" title={t('classDetail.sumWarning')} /> : null}
            {empty ? <EmptyClass onAdd={open} /> : <ClassEditor detail={detail} canEdit={canEdit} />}
            {empty || !canEdit ? null : (
                <div className="flex flex-col gap-3">
                    <ZeroQuantityNote />
                    <div>
                        <Button variant="secondary" onClick={open}>
                            <Plus className="size-4" aria-hidden="true" />
                            {t('classDetail.addAsset')}
                        </Button>
                    </div>
                </div>
            )}
            <RoleGate min="editor">
                <AddAssetModal open={adding} onOpenChange={setAdding} initialClassId={detail.class.classId} />
            </RoleGate>
        </section>
    );
}

function ClassDetailBody({ classId, holder }: { readonly classId: string; readonly holder: HolderParam }): ReactElement {
    const query: UseQueryResult<ClassDetail> = useClassDetail(classId, holder);
    if (query.error instanceof ApiError && query.error.problem.type === CLASS_NOT_FOUND) {
        return <NotFound />;
    }
    if (query.error !== null) {
        return (
            <DetailFailure
                error={query.error}
                onRetry={(): void => {
                    void query.refetch();
                }}
            />
        );
    }
    return query.data === undefined ? <DetailLoading /> : <DetailContent detail={query.data} />;
}

export function ClassDetailPage(): ReactElement {
    const { classId }: { classId: string } = useParams({ from: '/_auth/_app/portfolio/classes/$classId' });
    const holder: HolderParam = useHolderParam();
    return (
        <div className="flex flex-col gap-4">
            <div className="max-w-full empty:hidden">
                <HolderFilter />
            </div>
            <ClassDetailBody classId={classId} holder={holder} />
        </div>
    );
}
