import { Info } from 'lucide-react';
import type { TFunction } from 'i18next';
import type { ReactElement } from 'react';
import { Controller, useWatch, type FieldErrors, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import { formatCurrency } from '@/shared/lib/format/currency';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Field } from '@/shared/ui/field';
import { ClassTile } from '../../components/class-tile';
import { toClassColorKey } from '../../lib/class-color';
import { valueSourceKey } from '../../lib/value-source';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { AssetClassView, ValueSource } from '../../types';
import { exposureKind, type ExposureKind } from '../lib/exposure-note';
import { formatUnitPrice } from '../lib/format-unit-price';
import { suggestedClassId } from '../lib/suggested-class';
import { usePreviewValue, type PreviewValue } from '../lib/use-preview-value';
import type { PositionFormInput } from '../schemas/position.schema';
import type { CatalogAsset } from '../types';
import { ClassSelect } from './class-select';
import { ValueToday } from './value-today';

export interface PositionPreviewProps {
    readonly asset: CatalogAsset;
    readonly form: UseFormReturn<PositionFormInput>;
    readonly classes: readonly AssetClassView[];
    readonly formId: string;
    readonly alertMessage: string | null;
    readonly onSubmit: () => void;
}

const VALUE_SOURCES: readonly string[] = [
    'brapi',
    'finnhub',
    'twelvedata',
    'alphavantage',
    'coingecko',
    'tesouro_direto',
    'curve_cdi',
    'curve_pre',
    'curve_ipca'
];

function isValueSource(source: string): source is ValueSource {
    return VALUE_SOURCES.includes(source);
}

function PreviewTitle({
    asset,
    classes,
    classId
}: {
    readonly asset: CatalogAsset;
    readonly classes: readonly AssetClassView[];
    readonly classId: string;
}): ReactElement {
    const chosen: AssetClassView | undefined = classes.find((item: AssetClassView): boolean => item.id === classId);
    const suggested: AssetClassView | undefined = classes.find(
        (item: AssetClassView): boolean => item.id === suggestedClassId(classes, asset.suggestedClassKey)
    );
    const shown: AssetClassView | undefined = chosen ?? suggested;
    return (
        <div className="flex items-center gap-3">
            <ClassTile systemKey={shown?.systemKey ?? asset.suggestedClassKey} colorKey={toClassColorKey(shown?.colorKey ?? '')} />
            <span className="flex min-w-0 flex-col">
                <b className="text-base font-bold text-content">{asset.symbol}</b>
                <span className="truncate text-sm text-content-muted">{asset.name}</span>
            </span>
        </div>
    );
}

function Pills({ asset, preview }: { readonly asset: CatalogAsset; readonly preview: PreviewValue }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const { t: tp }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const locale: SupportedLocale = useLocale();
    return (
        <div className="flex flex-wrap gap-2">
            <Badge>{t(`kinds.${asset.kind}`)}</Badge>
            {preview.quote === null ? null : (
                <Badge className="numeric">{formatUnitPrice(preview.quote.price, preview.quote.currency, locale)}</Badge>
            )}
            {preview.quote !== null && isValueSource(preview.quote.source) ? (
                <Badge>{tp(valueSourceKey(preview.quote.source))}</Badge>
            ) : null}
        </div>
    );
}

function ValueBlock({ asset, preview }: { readonly asset: CatalogAsset; readonly preview: PreviewValue }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const locale: SupportedLocale = useLocale();
    const text: string =
        preview.valueMinor === null ? t('position.valueEmpty') : formatCurrency(preview.valueMinor, preview.baseCurrency, locale);
    const legend: string = asset.kind === 'treasury' ? t('position.legendTreasury') : t('position.legendQuote');
    return (
        <>
            <ValueToday label={t('position.valueLabel')} value={text} legend={legend} />
            {preview.quote === null ? <p className="text-xs text-content-muted">{t('position.noPrice')}</p> : null}
            {preview.exchangeMissing ? <p className="text-xs text-content-muted">{t('position.noRate')}</p> : null}
        </>
    );
}

function ExposureNote({
    asset,
    classes
}: {
    readonly asset: CatalogAsset;
    readonly classes: readonly AssetClassView[];
}): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const classLabel: ClassLabel = useClassLabel();
    const kind: ExposureKind | null = exposureKind(asset);
    const suggested: AssetClassView | undefined = classes.find(
        (item: AssetClassView): boolean => item.id === suggestedClassId(classes, asset.suggestedClassKey)
    );
    if (kind === null || suggested === undefined) {
        return null;
    }
    return (
        <p className="flex items-start gap-2 rounded-control bg-info/10 p-3 text-xs text-content">
            <Info className="mt-px size-4 shrink-0 text-info" aria-hidden="true" />
            {t(`exposurePreview.${kind}`, { className: classLabel(suggested.systemKey, suggested.name) })}
        </p>
    );
}

function quantityHint(t: TFunction<'portfolioAssets'>, decimals: number): string {
    return decimals === 0 ? t('position.quantityHintInteger') : t('position.quantityHint', { count: decimals });
}

function PositionClassField({
    asset,
    form,
    classes
}: {
    readonly asset: CatalogAsset;
    readonly form: UseFormReturn<PositionFormInput>;
    readonly classes: readonly AssetClassView[];
}): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <Controller
            control={form.control}
            name="classId"
            render={({ field }): ReactElement => (
                <ClassSelect
                    label={t('position.class')}
                    placeholder={t('position.classPlaceholder')}
                    value={field.value}
                    classes={classes}
                    error={form.formState.errors.classId?.message}
                    hint={asset.suggestedClassKey === null ? t('position.classNoSuggestion') : undefined}
                    onChange={field.onChange}
                />
            )}
        />
    );
}

function PositionFields({
    asset,
    form,
    classes
}: {
    readonly asset: CatalogAsset;
    readonly form: UseFormReturn<PositionFormInput>;
    readonly classes: readonly AssetClassView[];
}): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const errors: FieldErrors<PositionFormInput> = form.formState.errors;
    return (
        <>
            <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2">
                <Field
                    label={t('position.quantity')}
                    inputMode="decimal"
                    autoComplete="off"
                    hint={quantityHint(t, asset.quantityDecimals)}
                    error={errors.quantity?.message}
                    {...form.register('quantity')}
                />
                <Field
                    label={t('position.averagePrice')}
                    inputMode="decimal"
                    autoComplete="off"
                    error={errors.averagePrice?.message}
                    {...form.register('averagePrice')}
                />
            </div>
            <PositionClassField asset={asset} form={form} classes={classes} />
        </>
    );
}

export function PositionPreview({ asset, form, classes, formId, alertMessage, onSubmit }: PositionPreviewProps): ReactElement {
    const values: PositionFormInput = useWatch({ control: form.control }) as PositionFormInput;
    const preview: PreviewValue = usePreviewValue(asset, values.quantity);
    return (
        <form
            id={formId}
            noValidate
            onSubmit={(event): void => {
                event.preventDefault();
                onSubmit();
            }}
            className="@container flex flex-col gap-4"
        >
            <PreviewTitle asset={asset} classes={classes} classId={values.classId} />
            <Pills asset={asset} preview={preview} />
            {alertMessage === null ? null : <Alert title={alertMessage} />}
            <PositionFields asset={asset} form={form} classes={classes} />
            <ValueBlock asset={asset} preview={preview} />
            <ExposureNote asset={asset} classes={classes} />
        </form>
    );
}
