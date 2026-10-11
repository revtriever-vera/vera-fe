import { useEffect, useMemo, type ReactElement } from 'react';
import { Controller, useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { Modal } from '@/shared/ui/modal';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { AssetClassView } from '../../types';
import { takenClassNames } from '../lib/class-name-rules';
import { nextFreeColor } from '../lib/next-free-color';
import { createClassSchema, type ClassFormInput } from '../schemas/class.schema';
import { toClassColorKey } from '../../lib/class-color';
import { ColorPicker } from './color-picker';
import { useClassFormActions, type ClassFormActions, type ClassFormMode } from './use-class-form-actions';

const FORM_ID: string = 'class-form';

export interface ClassFormProps {
    readonly mode: ClassFormMode;
    readonly classes: readonly AssetClassView[];
    readonly onClose: () => void;
}

function initialValues(mode: ClassFormMode, classes: readonly AssetClassView[], label: ClassLabel): ClassFormInput {
    if (mode.kind === 'create') {
        return { name: '', colorKey: nextFreeColor(classes.map((item: AssetClassView) => toClassColorKey(item.colorKey))) };
    }
    return { name: label(mode.assetClass.systemKey, mode.assetClass.name), colorKey: toClassColorKey(mode.assetClass.colorKey) };
}

function canRestoreName(mode: ClassFormMode): boolean {
    return mode.kind === 'edit' && mode.assetClass.systemKey !== null && mode.assetClass.name !== null;
}

interface ClassFormState {
    readonly form: UseFormReturn<ClassFormInput>;
    readonly actions: ClassFormActions;
    readonly initial: ClassFormInput;
}

function useClassFormState({ mode, classes, onClose }: ClassFormProps): ClassFormState {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const label: ClassLabel = useClassLabel();
    const ignoreId: string | null = mode.kind === 'edit' ? mode.assetClass.id : null;
    const initial: ClassFormInput = initialValues(mode, classes, label);
    const schema: ReturnType<typeof createClassSchema> = useMemo(
        (): ReturnType<typeof createClassSchema> => createClassSchema(t, takenClassNames(classes, ignoreId)),
        [t, classes, ignoreId]
    );
    const form: UseFormReturn<ClassFormInput> = useForm<ClassFormInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: initial
    });
    const actions: ClassFormActions = useClassFormActions({ mode, initial, form, onClose });
    const { setFocus } = form;
    useEffect((): void => {
        setFocus('name');
    }, [setFocus]);
    return { form, actions, initial };
}

function RestoreNameButton({ busy, onRestore }: { readonly busy: boolean; readonly onRestore: () => Promise<void> }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <Button
            type="button"
            variant="secondary"
            size="sm"
            className="self-start"
            disabled={busy}
            onClick={(): void => {
                void onRestore();
            }}
        >
            {t('classes.form.restoreName')}
        </Button>
    );
}

function ClassFormFields({
    mode,
    form,
    actions
}: {
    readonly mode: ClassFormMode;
    readonly form: UseFormReturn<ClassFormInput>;
    readonly actions: ClassFormActions;
}): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <form
            id={FORM_ID}
            noValidate
            onSubmit={(event): void => {
                void form.handleSubmit(actions.save)(event);
            }}
            className="flex flex-col gap-4"
        >
            <Field
                label={t('classes.form.nameLabel')}
                hint={t('classes.form.nameHint')}
                error={form.formState.errors.name?.message}
                autoComplete="off"
                {...form.register('name')}
            />
            <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-content">{t('classes.form.colorLabel')}</span>
                <Controller
                    control={form.control}
                    name="colorKey"
                    render={({ field }): ReactElement => <ColorPicker value={field.value} onChange={field.onChange} />}
                />
            </div>
            {mode.kind === 'create' ? <p className="text-sm text-content-muted">{t('classes.form.newTargetNotice')}</p> : null}
            {canRestoreName(mode) ? <RestoreNameButton busy={actions.busy} onRestore={actions.restoreName} /> : null}
        </form>
    );
}

export function ClassForm(props: ClassFormProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const { form, actions, initial }: ClassFormState = useClassFormState(props);
    const create: boolean = props.mode.kind === 'create';
    return (
        <Modal
            title={create ? t('classes.form.createTitle') : t('classes.form.renameTitle', { name: initial.name })}
            onClose={props.onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={props.onClose}>
                        {t('classes.form.cancel')}
                    </Button>
                    <Button type="submit" form={FORM_ID} loading={actions.busy}>
                        {actions.busy ? t('classes.form.saving') : create ? t('classes.form.create') : t('classes.form.save')}
                    </Button>
                </>
            }
        >
            <ClassFormFields mode={props.mode} form={form} actions={actions} />
        </Modal>
    );
}
