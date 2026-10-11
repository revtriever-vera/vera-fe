import { useMemo, type ReactElement } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { z } from 'zod';
import { Field } from '@/shared/ui/field';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import type { SelectChoice } from '@/shared/ui/select-menu';
import { InstitutionAvatar } from '../../components/institution-avatar';
import { SPENDING_CURRENCY, type AccountView, type ImportPreview } from '../../types';
import type { ImportTarget } from '../lib/build-import-form-data';
import {
    NEW_ACCOUNT_KINDS,
    TARGET_MODES,
    createAccountTargetSchema,
    defaultTargetValues,
    toImportTarget,
    type AccountTargetFormValues,
    type TargetMode
} from '../schemas/account-target.schema';
import { LabeledSelect } from './labeled-select';

export interface AccountTargetProps {
    readonly formId: string;
    readonly preview: ImportPreview;
    readonly accounts: readonly AccountView[];
    readonly onSubmit: (target: ImportTarget, accountCurrency: string) => void;
}

type Translate = UseTranslationResponse<'spendingImports', undefined>['t'];

function suggestionText(t: Translate, preview: ImportPreview, accounts: readonly AccountView[]): string | null {
    const account: AccountView | undefined = accounts.find((item: AccountView): boolean => item.id === preview.suggestedAccountId);
    if (account === undefined) {
        return null;
    }
    const last4: string | null = preview.accountHint?.numberLast4 ?? account.numberLast4;
    return last4 === null
        ? t('target.suggestion', { account: account.name })
        : t('target.suggestionWithLast4', { account: account.name, last4 });
}

function currencyOf(values: AccountTargetFormValues, accounts: readonly AccountView[], preview: ImportPreview): string {
    const account: AccountView | undefined = accounts.find((item: AccountView): boolean => item.id === values.accountId);
    return (values.mode === 'existing' ? account?.currency : preview.currency) ?? SPENDING_CURRENCY;
}

function ExistingAccountField({ form, accounts, suggestion }: ExistingProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const choices: readonly SelectChoice[] = accounts.map((account: AccountView): SelectChoice => ({
        value: account.id,
        label: account.name,
        warning: null,
        icon: <InstitutionAvatar name={account.institutionName ?? account.name} logoUrl={account.institutionLogoUrl} size="sm" />
    }));
    return (
        <Controller
            control={form.control}
            name="accountId"
            render={({ field, fieldState }): ReactElement => (
                <LabeledSelect
                    label={t('target.accountLabel')}
                    value={field.value}
                    choices={choices}
                    placeholder={t('target.accountPlaceholder')}
                    error={fieldState.error?.message}
                    note={suggestion}
                    onChange={field.onChange}
                />
            )}
        />
    );
}

interface ExistingProps {
    readonly form: UseFormReturn<AccountTargetFormValues>;
    readonly accounts: readonly AccountView[];
    readonly suggestion: string | null;
}

function NewAccountFields({ form }: { readonly form: UseFormReturn<AccountTargetFormValues> }): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const choices: readonly SelectChoice[] = NEW_ACCOUNT_KINDS.map((kind: (typeof NEW_ACCOUNT_KINDS)[number]): SelectChoice => ({
        value: kind,
        label: ts(`accountKinds.${kind}`),
        warning: null
    }));
    const { errors } = form.formState;
    return (
        <div className="flex flex-col gap-3">
            <Field
                label={t('target.nameLabel')}
                placeholder={t('target.namePlaceholder')}
                autoComplete="off"
                error={errors.newAccountName?.message}
                {...form.register('newAccountName')}
            />
            <Controller
                control={form.control}
                name="newAccountKind"
                render={({ field }): ReactElement => (
                    <LabeledSelect
                        label={t('target.kindLabel')}
                        value={field.value}
                        choices={choices}
                        placeholder={t('target.kindLabel')}
                        onChange={field.onChange}
                    />
                )}
            />
            <Field
                label={t('target.institutionLabel')}
                autoComplete="off"
                error={errors.newAccountInstitution?.message}
                {...form.register('newAccountInstitution')}
            />
        </div>
    );
}

function useTargetForm(props: AccountTargetProps): UseFormReturn<AccountTargetFormValues> {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const schema: z.ZodType<AccountTargetFormValues> = useMemo((): z.ZodType<AccountTargetFormValues> => createAccountTargetSchema(t), [t]);
    return useForm<AccountTargetFormValues>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: defaultTargetValues(props.accounts, props.preview.suggestedAccountId, props.preview.accountHint?.institution ?? null)
    });
}

export function AccountTarget(props: AccountTargetProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const { formId, preview, accounts, onSubmit } = props;
    const form: UseFormReturn<AccountTargetFormValues> = useTargetForm(props);
    const mode: TargetMode = useWatch({ control: form.control, name: 'mode' });
    const options: readonly SegmentedOption<TargetMode>[] = [
        { value: TARGET_MODES[0], label: t('target.existing') },
        { value: TARGET_MODES[1], label: t('target.new') }
    ];
    const submit: ReturnType<typeof form.handleSubmit> = form.handleSubmit((values: AccountTargetFormValues): void => {
        onSubmit(toImportTarget(values), currencyOf(values, accounts, preview));
    });
    return (
        <form
            id={formId}
            noValidate
            onSubmit={(event): void => {
                void submit(event);
            }}
            className="flex flex-col gap-3"
        >
            <h3 className="text-sm font-semibold text-content">{t('target.title')}</h3>
            {accounts.length === 0 ? null : (
                <Controller
                    control={form.control}
                    name="mode"
                    render={({ field }): ReactElement => (
                        <SegmentedControl label={t('target.modeLabel')} options={options} value={field.value} onChange={field.onChange} />
                    )}
                />
            )}
            {mode === 'existing' ? (
                <ExistingAccountField form={form} accounts={accounts} suggestion={suggestionText(t, preview, accounts)} />
            ) : (
                <NewAccountFields form={form} />
            )}
            <p className="text-2xs text-content-subtle">{t('target.pluggyHint')}</p>
        </form>
    );
}
