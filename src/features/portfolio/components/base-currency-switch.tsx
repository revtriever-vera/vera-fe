import type { ReactElement } from 'react';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { useUpdatePortfolioSettings } from '../api/use-portfolio-settings.mutation';
import { usePortfolioSettings } from '../api/use-portfolio-settings.query';
import { portfolioErrorMessage } from '../lib/portfolio-error-message';
import { BASE_CURRENCIES, type BaseCurrency, type PortfolioSettings, type UpdatePortfolioSettings } from '../types';

export function BaseCurrencySwitch(): ReactElement {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const toast: ToastApi = useToast();
    const settings: UseQueryResult<PortfolioSettings> = usePortfolioSettings();
    const update: UseMutationResult<PortfolioSettings, ApiError, UpdatePortfolioSettings> = useUpdatePortfolioSettings();
    const options: readonly SegmentedOption<BaseCurrency>[] = [
        { value: BASE_CURRENCIES[0], label: t('baseCurrency.brl') },
        { value: BASE_CURRENCIES[1], label: t('baseCurrency.usd') }
    ];
    const pending: BaseCurrency | undefined = update.isPending ? update.variables.baseCurrency : undefined;
    const change = (baseCurrency: BaseCurrency): void => {
        update.mutate(
            { baseCurrency },
            {
                onError: (error: Error): void => {
                    toast.show({ tone: 'critical', title: t('baseCurrency.updateError'), detail: portfolioErrorMessage(t, error) });
                }
            }
        );
    };
    return (
        <SegmentedControl
            label={t('baseCurrency.label')}
            options={options}
            value={pending ?? settings.data?.baseCurrency ?? BASE_CURRENCIES[0]}
            onChange={change}
            disabled={settings.data === undefined || update.isPending}
            busy={update.isPending}
        />
    );
}
