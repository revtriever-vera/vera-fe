import { useState, type BaseSyntheticEvent, type ReactElement } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseMutationResult } from '@tanstack/react-query';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Card } from '@/shared/ui/card';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { formatShareBps } from '../../lib/format-bps';
import { portfolioErrorMessage } from '../../lib/portfolio-error-message';
import type { AssetClassView, ClassesResponse, Overview, OverviewClass, SaveClassTargetsBody } from '../../types';
import { useSaveClassTargets } from '../api/use-save-class-targets.mutation';
import { sortedClasses, sumReceivedBps, toFormValues, toSaveBody } from '../lib/targets-form';
import { useClassTargetsForm, type ClassTargetsFormState } from '../lib/use-class-targets-form';
import { useUnsavedGuard, type UnsavedGuard } from '../lib/use-unsaved-guard';
import { FULL_TARGET_BPS, type ClassTargetsFormValues } from '../schemas/class-targets.schema';
import { ClassTargetRow } from './class-target-row';
import { ResetTargetsDialog } from './reset-targets-dialog';
import { TargetsActions } from './targets-actions';
import { TargetsTotalChip } from './targets-total-chip';

export interface ClassTargetsCardProps {
    readonly classes: readonly AssetClassView[];
    readonly overview: Overview | undefined;
}

type SaveMutation = UseMutationResult<ClassesResponse, ApiError, SaveClassTargetsBody>;

function todayOf(overview: Overview | undefined, classId: string, locale: SupportedLocale, fallback: string): string {
    const found: OverviewClass | undefined = overview?.classes.find((item: OverviewClass): boolean => item.classId === classId);
    return overview === undefined || overview.empty || found === undefined ? fallback : formatShareBps(found.shareBps, locale);
}

function SaveFailure({ error }: { readonly error: Error }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const { t: tp }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const locale: SupportedLocale = useLocale();
    const received: number | null = sumReceivedBps(error);
    const percent: Intl.NumberFormat = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2 });
    const extra: string = received === null ? '' : ` ${t('targets.sumReceived', { sum: percent.format(received / FULL_TARGET_BPS) })}`;
    return <Alert title={t('targets.saveFailed')} detail={`${portfolioErrorMessage(tp, error)}${extra}`} />;
}

function useSubmitTargets(
    form: UseFormReturn<ClassTargetsFormValues>,
    save: SaveMutation,
    canSave: boolean
): (event?: BaseSyntheticEvent) => Promise<void> {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const toast: ToastApi = useToast();
    return form.handleSubmit(async (input: ClassTargetsFormValues): Promise<void> => {
        if (!canSave) {
            return;
        }
        try {
            const saved: ClassesResponse = await save.mutateAsync(toSaveBody(input));
            form.reset(toFormValues(saved.data));
            track('portfolio_targets_saved');
            toast.show({ tone: 'positive', title: t('targets.saved') });
        } catch {
            return;
        }
    });
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

interface TargetsListProps {
    readonly fields: ClassTargetsFormState['fields'];
    readonly classes: readonly AssetClassView[];
    readonly overview: Overview | undefined;
    readonly control: UseFormReturn<ClassTargetsFormValues>['control'];
}

function TargetsList({ fields, classes, overview, control }: TargetsListProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const locale: SupportedLocale = useLocale();
    const byId: ReadonlyMap<string, AssetClassView> = new Map(
        classes.map((item: AssetClassView): [string, AssetClassView] => [item.id, item])
    );
    return (
        <>
            <div
                className="hidden grid-cols-[minmax(0,1fr)_5rem_auto_4.5rem] gap-x-3 border-b border-border pb-2 text-xs font-semibold text-content-muted md:grid"
                aria-hidden="true"
            >
                <span>{t('targets.columns.class')}</span>
                <span className="text-right">{t('targets.columns.today')}</span>
                <span className="text-right">{t('targets.columns.target')}</span>
                <span />
            </div>
            <ul aria-label={t('targets.listLabel')} className="divide-y divide-border">
                {fields.map((field, index: number): ReactElement | null => {
                    const assetClass: AssetClassView | undefined = byId.get(field.classId);
                    const today: string = todayOf(overview, field.classId, locale, t('targets.noValue'));
                    return assetClass === undefined ? null : (
                        <ClassTargetRow key={field.id} index={index} assetClass={assetClass} today={today} control={control} />
                    );
                })}
            </ul>
        </>
    );
}

interface FooterProps {
    readonly state: ClassTargetsFormState;
    readonly saving: boolean;
    readonly onDiscard: () => void;
    readonly onReset: () => void;
}

function TargetsFooter({ state, saving, onDiscard, onReset }: FooterProps): ReactElement {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <TargetsTotalChip sumBps={state.sum} />
            <TargetsActions dirty={state.dirty} canSave={state.canSave} saving={saving} onDiscard={onDiscard} onReset={onReset} />
        </div>
    );
}

interface DialogsProps {
    readonly resetting: boolean;
    readonly guard: UnsavedGuard;
    readonly onRestore: (classes: ClassesResponse) => void;
    readonly onCloseReset: () => void;
}

function TargetsDialogs({ resetting, guard, onRestore, onCloseReset }: DialogsProps): ReactElement {
    return (
        <>
            {resetting ? <ResetTargetsDialog onReset={onRestore} onClose={onCloseReset} /> : null}
            {guard.blocked ? <UnsavedDialog guard={guard} /> : null}
        </>
    );
}

interface FormProps extends ClassTargetsCardProps {
    readonly state: ClassTargetsFormState;
    readonly save: SaveMutation;
    readonly onRestore: (classes: ClassesResponse) => void;
    readonly onReset: () => void;
}

function TargetsForm({ state, save, classes, overview, onRestore, onReset }: FormProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const submit: (event?: BaseSyntheticEvent) => Promise<void> = useSubmitTargets(state.form, save, state.canSave);
    return (
        <form
            noValidate
            onSubmit={(event: BaseSyntheticEvent): void => {
                void submit(event);
            }}
            className="flex flex-col gap-4"
        >
            <TargetsList fields={state.fields} classes={sortedClasses(classes)} overview={overview} control={state.form.control} />
            {overview?.empty === true ? <p className="text-sm text-content-muted">{t('targets.emptyHint')}</p> : null}
            <TargetsFooter
                state={state}
                saving={save.isPending}
                onDiscard={(): void => {
                    onRestore({ data: [...classes] });
                }}
                onReset={onReset}
            />
        </form>
    );
}

export function ClassTargetsCard({ classes, overview }: ClassTargetsCardProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const state: ClassTargetsFormState = useClassTargetsForm(classes);
    const save: SaveMutation = useSaveClassTargets();
    const guard: UnsavedGuard = useUnsavedGuard(state.dirty);
    const [resetting, setResetting] = useState<boolean>(false);
    const restore = (next: ClassesResponse): void => {
        state.form.reset(toFormValues(next.data));
        save.reset();
    };
    return (
        <Card className="flex flex-col gap-4">
            <div>
                <h3 className="text-base font-semibold">{t('targets.title')}</h3>
                <p className="text-sm text-content-muted">{t('targets.description')}</p>
            </div>
            {save.error === null ? null : <SaveFailure error={save.error} />}
            <TargetsForm
                state={state}
                save={save}
                classes={classes}
                overview={overview}
                onRestore={restore}
                onReset={(): void => {
                    setResetting(true);
                }}
            />
            <TargetsDialogs
                resetting={resetting}
                guard={guard}
                onRestore={restore}
                onCloseReset={(): void => {
                    setResetting(false);
                }}
            />
        </Card>
    );
}
