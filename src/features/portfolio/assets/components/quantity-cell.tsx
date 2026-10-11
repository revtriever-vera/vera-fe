import { useState, type ChangeEvent, type KeyboardEvent, type ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { cn } from '@/shared/lib/cn';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { PositionView } from '../types';
import type { HoldingView } from '../../types';
import { useUpdatePosition, type UpdatePositionInput } from '../api/use-update-position.mutation';
import { useFailureReporter } from '../lib/use-failure-reporter';
import { displayQuantity, isZeroQuantity, parseQuantityDraft, type QuantityDraft } from '../lib/quantity-draft';

export interface QuantityCellProps {
    readonly holding: HoldingView;
}

interface QuantityEditor {
    readonly draft: string;
    readonly error: string | null;
    readonly busy: boolean;
    readonly change: (event: ChangeEvent<HTMLInputElement>) => void;
    readonly commit: () => void;
    readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

interface QuantitySave {
    readonly save: (value: string) => void;
    readonly busy: boolean;
}

function useQuantitySave(holding: HoldingView, onFailure: (message: string) => void): QuantitySave {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const toast: ToastApi = useToast();
    const update: UseMutationResult<PositionView, ApiError, UpdatePositionInput> = useUpdatePosition();
    const report: (failure: Error) => void = useFailureReporter({ onQuantity: onFailure, onAlert: onFailure }, t('toasts.updateFailed'));
    const save = (value: string): void => {
        update.mutate(
            { id: holding.id, body: { quantity: value } },
            {
                onSuccess: (): void => {
                    toast.show({ tone: 'positive', title: t('toasts.updated', { symbol: holding.symbol }) });
                },
                onError: report
            }
        );
    };
    return { save, busy: update.isPending };
}

function useQuantityEditor(holding: HoldingView): QuantityEditor {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const locale: SupportedLocale = useLocale();
    const saved: string = holding.quantity ?? '0';
    const original: string = displayQuantity(saved, locale);
    const [draft, setDraft] = useState<string>(original);
    const [error, setError] = useState<string | null>(null);
    const fail = (message: string): void => {
        setDraft(original);
        setError(message);
    };
    const { save, busy }: QuantitySave = useQuantitySave(holding, fail);
    const commit = (): void => {
        const parsed: QuantityDraft = parseQuantityDraft(t, draft, holding.quantityDecimals ?? 0);
        if (!parsed.ok) {
            fail(parsed.message);
            return;
        }
        if (parsed.value === saved || busy) {
            setDraft(original);
            return;
        }
        save(parsed.value);
    };
    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter') {
            event.preventDefault();
            commit();
        }
        if (event.key === 'Escape') {
            setDraft(original);
            setError(null);
        }
    };
    const change = (event: ChangeEvent<HTMLInputElement>): void => {
        setDraft(event.target.value);
        setError(null);
    };
    return { draft, error, busy, change, commit, onKeyDown };
}

export function QuantityCell({ holding }: QuantityCellProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const editor: QuantityEditor = useQuantityEditor(holding);
    return (
        <div className="flex flex-col gap-1">
            <input
                value={editor.draft}
                inputMode="decimal"
                autoComplete="off"
                aria-label={t('quantity.label', { symbol: holding.symbol })}
                aria-invalid={editor.error === null ? undefined : true}
                aria-busy={editor.busy}
                disabled={editor.busy}
                onChange={editor.change}
                onBlur={editor.commit}
                onKeyDown={editor.onKeyDown}
                className={cn(
                    'numeric h-9 w-28 rounded-control border border-border bg-surface px-2 text-right text-sm text-content',
                    'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none disabled:opacity-60',
                    editor.error !== null && 'border-critical focus:border-critical focus:ring-critical/20'
                )}
            />
            {editor.error === null ? null : (
                <p role="alert" className="max-w-40 text-2xs text-critical">
                    {editor.error}
                </p>
            )}
            {editor.error === null && isZeroQuantity(holding.quantity) ? (
                <p className="max-w-40 text-2xs text-content-muted">{t('quantity.zeroHint')}</p>
            ) : null}
        </div>
    );
}
