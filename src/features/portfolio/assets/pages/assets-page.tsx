import { Plus } from 'lucide-react';
import { useEffect, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Link, useNavigate, useSearch, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { RoleGate } from '@/app/providers/role-gate';
import { useRole } from '@/app/providers/use-role';
import { Button, buttonVariants } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { SkeletonTable } from '@/shared/ui/skeleton-table';
import { BaseCurrencySwitch } from '../../components/base-currency-switch';
import { DataSourcesNote } from '../../components/data-sources-note';
import { ConcentrationTab } from '../../concentration/components/concentration-tab';
import { useClasses } from '../../api/use-classes.query';
import { useHoldings } from '../../api/use-holdings.query';
import type { ClassesResponse, HoldingsResponse } from '../../types';
import { AddAssetModal } from '../components/add-asset-modal';
import { AssetsTabs } from '../components/assets-tabs';
import { ExportMenu } from '../components/export-menu';
import { HoldingsSection } from '../components/holdings-section';
import { DEFAULT_ASSETS_TAB } from '../lib/assets-tab';
import type { AssetsTab } from '../types';

function AssetsLoading(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <SkeletonTable
            label={t('page.loading')}
            columns={[t('columns.asset'), t('columns.class'), t('columns.quantity'), t('columns.value'), t('columns.source')]}
        />
    );
}

function AssetsFailure({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <div className="flex flex-col items-start gap-3">
            <FailureAlert error={error} title={t('page.loadError')} />
            <Button variant="secondary" onClick={onRetry}>
                {t('page.retry')}
            </Button>
        </div>
    );
}

function AssetsEmpty({ onAdd }: { readonly onAdd: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const { canEdit } = useRole();
    if (!canEdit) {
        return <EmptyState title={t('empty.viewerTitle')} description={t('empty.viewerDescription')} />;
    }
    return (
        <EmptyState
            title={t('empty.title')}
            description={t('empty.description')}
            actions={
                <>
                    <Button onClick={onAdd}>
                        <Plus className="size-4" aria-hidden="true" />
                        {t('addButton')}
                    </Button>
                    <Link to="/portfolio/get-started" className={buttonVariants({ variant: 'secondary' })}>
                        {t('empty.guide')}
                    </Link>
                </>
            }
        />
    );
}

interface BodyProps {
    readonly holdings: UseQueryResult<HoldingsResponse>;
    readonly classes: UseQueryResult<ClassesResponse>;
    readonly onAdd: () => void;
}

function AssetsBody({ holdings, classes, onAdd }: BodyProps): ReactElement {
    const failure: Error | null = holdings.error ?? classes.error;
    if (failure !== null) {
        return (
            <AssetsFailure
                error={failure}
                onRetry={(): void => {
                    void holdings.refetch();
                    void classes.refetch();
                }}
            />
        );
    }
    if (holdings.data === undefined || classes.data === undefined) {
        return <AssetsLoading />;
    }
    if (holdings.data.data.length === 0) {
        return <AssetsEmpty onAdd={onAdd} />;
    }
    return <HoldingsSection holdings={holdings.data.data} classes={classes.data.data} baseCurrency={holdings.data.baseCurrency} />;
}

function AssetsHeader({ empty, onAdd }: { readonly empty: boolean; readonly onAdd: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
                <h2 className="text-xl font-extrabold">{t('title')}</h2>
                <p className="max-w-xl text-sm text-content-muted">{t('description')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <BaseCurrencySwitch />
                <ExportMenu />
                {empty ? null : (
                    <RoleGate min="editor">
                        <Button onClick={onAdd}>
                            <Plus className="size-4" aria-hidden="true" />
                            {t('addButton')}
                        </Button>
                    </RoleGate>
                )}
            </div>
        </div>
    );
}

export function AssetsPage(): ReactElement {
    const search: { add?: boolean; classId?: string; tab?: AssetsTab } = useSearch({ from: '/_auth/_app/portfolio/assets' });
    const navigate: UseNavigateResult<string> = useNavigate();
    const holdings: UseQueryResult<HoldingsResponse> = useHoldings();
    const classes: UseQueryResult<ClassesResponse> = useClasses();
    const tab: AssetsTab = search.tab ?? DEFAULT_ASSETS_TAB;
    useEffect((): void => {
        track('assets_tab_viewed', { tab });
    }, [tab]);
    const setOpen = (open: boolean): void => {
        void navigate({
            to: '/portfolio/assets',
            search: open ? { add: true, classId: search.classId, tab: search.tab } : { tab: search.tab },
            replace: true
        });
    };
    const openModal = (): void => {
        setOpen(true);
    };
    const changeTab = (next: AssetsTab): void => {
        void navigate({ to: '/portfolio/assets', search: { tab: next === DEFAULT_ASSETS_TAB ? undefined : next }, replace: true });
    };
    return (
        <section className="flex flex-col gap-4">
            <AssetsHeader empty={holdings.data?.data.length === 0} onAdd={openModal} />
            <AssetsTabs
                value={tab}
                onValueChange={changeTab}
                panels={{
                    list: <AssetsBody holdings={holdings} classes={classes} onAdd={openModal} />,
                    concentration: <ConcentrationTab />
                }}
            />
            <DataSourcesNote />
            <RoleGate min="editor">
                <AddAssetModal open={search.add === true} onOpenChange={setOpen} initialClassId={search.classId} />
            </RoleGate>
        </section>
    );
}
