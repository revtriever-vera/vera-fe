import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useClasses } from '../../api/use-classes.query';
import { useHoldings } from '../../api/use-holdings.query';
import type { AssetClassView, ClassesResponse, HoldingsResponse } from '../../types';
import { CLASS_LIMIT } from '../lib/class-name-rules';
import { holdingsByClass } from '../lib/holdings-by-class';
import { ClassForm } from './class-form';
import { ClassManagerRow } from './class-manager-row';
import { DeleteClassDialog } from './delete-class-dialog';
import { MergeClassesDialog } from './merge-classes-dialog';

export interface ClassManagerDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

type ManagerView =
    | { readonly kind: 'list' }
    | { readonly kind: 'create' }
    | { readonly kind: 'edit'; readonly classId: string }
    | { readonly kind: 'merge'; readonly classId: string }
    | { readonly kind: 'delete'; readonly classId: string };

const LIST_VIEW: ManagerView = { kind: 'list' };
const FULL_TARGET_BPS: number = 10000;
const LIMIT_NOTE_ID: string = 'class-limit-note';

interface ListProps {
    readonly classes: readonly AssetClassView[];
    readonly counts: ReadonlyMap<string, number>;
    readonly onChange: (view: ManagerView) => void;
    readonly onClose: () => void;
}

function ClassList({ classes, counts, onChange, onClose }: ListProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const targetSum: number = classes.reduce((sum: number, item: AssetClassView): number => sum + item.targetBps, 0);
    return (
        <div className="flex flex-col gap-3">
            {targetSum === FULL_TARGET_BPS ? null : (
                <Alert
                    tone="caution"
                    title={t('classes.targetSumWarning')}
                    action={
                        <button type="button" className="underline" onClick={onClose}>
                            {t('classes.targetSumAction')}
                        </button>
                    }
                />
            )}
            <ul aria-label={t('classes.listLabel')} className="divide-y divide-border">
                {classes.map((item: AssetClassView): ReactElement => (
                    <ClassManagerRow
                        key={item.id}
                        assetClass={item}
                        holdingsCount={counts.get(item.id) ?? 0}
                        onRename={(): void => {
                            onChange({ kind: 'edit', classId: item.id });
                        }}
                        onMerge={(): void => {
                            onChange({ kind: 'merge', classId: item.id });
                        }}
                        onDelete={(): void => {
                            onChange({ kind: 'delete', classId: item.id });
                        }}
                    />
                ))}
            </ul>
        </div>
    );
}

function ListFooter({
    full,
    onNew,
    onClose
}: {
    readonly full: boolean;
    readonly onNew: () => void;
    readonly onClose: () => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <p id={LIMIT_NOTE_ID} className="text-xs text-content-muted">
                {full ? t('classes.limitReached') : null}
            </p>
            <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>
                    {t('classes.close')}
                </Button>
                <Button disabled={full} aria-describedby={full ? LIMIT_NOTE_ID : undefined} onClick={onNew}>
                    {t('classes.new')}
                </Button>
            </div>
        </div>
    );
}

function ManagerShell({
    onClose,
    footer,
    children
}: {
    readonly onClose: () => void;
    readonly footer: ReactElement | null;
    readonly children: ReactElement;
}): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <Modal title={t('classes.title')} description={t('classes.description')} onClose={onClose} footer={footer}>
            {children}
        </Modal>
    );
}

function ManagerLoading({ onClose }: { readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <ManagerShell onClose={onClose} footer={null}>
            <Loading label={t('classes.loading')} className="flex flex-col gap-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </Loading>
        </ManagerShell>
    );
}

function ManagerFailure({ onClose, onRetry }: { readonly onClose: () => void; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <ManagerShell onClose={onClose} footer={null}>
            <Alert
                title={t('classes.loadError')}
                action={
                    <button type="button" className="underline" onClick={onRetry}>
                        {t('classes.retry')}
                    </button>
                }
            />
        </ManagerShell>
    );
}

interface ViewsProps {
    readonly classes: readonly AssetClassView[];
    readonly counts: ReadonlyMap<string, number>;
    readonly onClose: () => void;
}

function ManagerOverlay({ view, classes, counts, onBack, fallback }: OverlayProps): ReactElement {
    if (view.kind === 'create') {
        return <ClassForm mode={{ kind: 'create' }} classes={classes} onClose={onBack} />;
    }
    const target: AssetClassView | undefined =
        view.kind === 'list' ? undefined : classes.find((item: AssetClassView): boolean => item.id === view.classId);
    if (target === undefined) {
        return fallback;
    }
    switch (view.kind) {
        case 'edit':
            return <ClassForm mode={{ kind: 'edit', assetClass: target }} classes={classes} onClose={onBack} />;
        case 'merge':
            return <MergeClassesDialog source={target} classes={classes} sourceHoldings={counts.get(target.id) ?? 0} onClose={onBack} />;
        case 'delete':
            return <DeleteClassDialog assetClass={target} onClose={onBack} />;
        case 'list':
            return fallback;
    }
}

interface OverlayProps {
    readonly view: ManagerView;
    readonly classes: readonly AssetClassView[];
    readonly counts: ReadonlyMap<string, number>;
    readonly onBack: () => void;
    readonly fallback: ReactElement;
}

function ManagerViews({ classes, counts, onClose }: ViewsProps): ReactElement {
    const [view, setView] = useState<ManagerView>(LIST_VIEW);
    const list: ReactElement = (
        <ManagerShell
            onClose={onClose}
            footer={
                <ListFooter
                    full={classes.length >= CLASS_LIMIT}
                    onNew={(): void => {
                        setView({ kind: 'create' });
                    }}
                    onClose={onClose}
                />
            }
        >
            <ClassList classes={classes} counts={counts} onChange={setView} onClose={onClose} />
        </ManagerShell>
    );
    return (
        <ManagerOverlay
            view={view}
            classes={classes}
            counts={counts}
            fallback={list}
            onBack={(): void => {
                setView(LIST_VIEW);
            }}
        />
    );
}

function ManagerContent({ onClose }: { readonly onClose: () => void }): ReactElement {
    const classes: UseQueryResult<ClassesResponse> = useClasses();
    const holdings: UseQueryResult<HoldingsResponse> = useHoldings();
    if (classes.isError || holdings.isError) {
        return (
            <ManagerFailure
                onClose={onClose}
                onRetry={(): void => {
                    void classes.refetch();
                    void holdings.refetch();
                }}
            />
        );
    }
    if (classes.data === undefined || holdings.data === undefined) {
        return <ManagerLoading onClose={onClose} />;
    }
    const sorted: readonly AssetClassView[] = [...classes.data.data].sort(
        (a: AssetClassView, b: AssetClassView): number => a.sortOrder - b.sortOrder
    );
    return <ManagerViews classes={sorted} counts={holdingsByClass(holdings.data.data)} onClose={onClose} />;
}

export function ClassManagerDialog({ open, onOpenChange }: ClassManagerDialogProps): ReactElement | null {
    if (!open) {
        return null;
    }
    return (
        <ManagerContent
            onClose={(): void => {
                onOpenChange(false);
            }}
        />
    );
}
