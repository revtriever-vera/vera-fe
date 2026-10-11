import { useMemo, useState, type ReactElement } from 'react';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { z } from 'zod';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { Skeleton } from '@/shared/ui/skeleton';
import { usePosition } from '../api/use-position.query';
import { useUpdatePosition, type UpdatePositionInput } from '../api/use-update-position.mutation';
import { useFailureReporter } from '../lib/use-failure-reporter';
import { createQuantityFormSchema, type QuantityFormInput } from '../schemas/position.schema';
import type { CatalogAsset, PositionView } from '../types';

export interface ExistingPositionPanelProps {
    readonly positionId: string;
    readonly asset: CatalogAsset;
    readonly onDone: () => void;
}

function formatQuantity(quantity: string, locale: SupportedLocale): string {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 10 }).format(Number(quantity));
}

interface QuantityFormProps {
    readonly position: PositionView;
    readonly asset: CatalogAsset;
    readonly onDone: () => void;
}

interface QuantityFormState {
    readonly form: UseFormReturn<QuantityFormInput>;
    readonly submit: () => Promise<void>;
    readonly busy: boolean;
    readonly alertMessage: string | null;
}

function useQuantityForm({ position, asset, onDone }: QuantityFormProps): QuantityFormState {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const toast: ToastApi = useToast();
    const update: UseMutationResult<PositionView, ApiError, UpdatePositionInput> = useUpdatePosition();
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const schema: z.ZodType<QuantityFormInput> = useMemo(
        (): z.ZodType<QuantityFormInput> => createQuantityFormSchema(t, asset.quantityDecimals),
        [t, asset.quantityDecimals]
    );
    const form: UseFormReturn<QuantityFormInput> = useForm<QuantityFormInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: { quantity: position.quantity }
    });
    const report: (error: Error) => void = useFailureReporter(
        {
            onQuantity: (message: string): void => {
                form.setError('quantity', { type: 'server', message });
            },
            onAlert: setAlertMessage
        },
        t('toasts.updateFailed')
    );
    const submit: () => Promise<void> = form.handleSubmit(async (input: QuantityFormInput): Promise<void> => {
        setAlertMessage(null);
        try {
            await update.mutateAsync({ id: position.id, body: { quantity: input.quantity } });
            toast.show({ tone: 'positive', title: t('toasts.updated', { symbol: asset.symbol }) });
            onDone();
        } catch (error) {
            report(error as Error);
        }
    });
    return { form, submit, busy: update.isPending, alertMessage };
}

function QuantityForm(props: QuantityFormProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const { form, submit, busy, alertMessage }: QuantityFormState = useQuantityForm(props);
    return (
        <form
            noValidate
            onSubmit={(event): void => {
                event.preventDefault();
                void submit();
            }}
            className="flex flex-col gap-3"
        >
            {alertMessage === null ? null : <Alert title={alertMessage} />}
            <Field
                label={t('existing.quantity')}
                inputMode="decimal"
                autoComplete="off"
                error={form.formState.errors.quantity?.message}
                {...form.register('quantity')}
            />
            <Button type="submit" loading={busy}>
                {busy ? t('existing.updating') : t('existing.update')}
            </Button>
        </form>
    );
}

export function ExistingPositionPanel({ positionId, asset, onDone }: ExistingPositionPanelProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const locale: SupportedLocale = useLocale();
    const position: UseQueryResult<PositionView> = usePosition(positionId);
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-content">{t('existing.title')}</h3>
                <p className="text-sm text-content-muted">{t('existing.description')}</p>
            </div>
            <p className="text-sm text-content">
                <b>{asset.symbol}</b> <span className="text-content-muted">{asset.name}</span>
            </p>
            {position.isPending ? <Skeleton className="h-24 w-full" /> : null}
            {position.isError ? <Alert title={t('existing.loadFailed')} /> : null}
            {position.data === undefined ? null : (
                <>
                    <dl className="flex items-baseline gap-2 text-sm">
                        <dt className="text-content-muted">{t('existing.current')}</dt>
                        <dd className="numeric font-semibold text-content">{formatQuantity(position.data.quantity, locale)}</dd>
                    </dl>
                    <QuantityForm key={position.data.id} position={position.data} asset={asset} onDone={onDone} />
                </>
            )}
        </div>
    );
}
