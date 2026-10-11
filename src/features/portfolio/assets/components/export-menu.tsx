import { Download } from 'lucide-react';
import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import { Button } from '@/shared/ui/button';
import { DropdownMenu, type DropdownItem } from '@/shared/ui/dropdown-menu';
import { useExportPortfolio, type ExportPortfolioInput } from '../api/use-export-portfolio.mutation';
import { exportErrorMessage } from '../lib/export-error-message';
import { EXPORT_FORMATS } from '../types';
import type { ExportFormat } from '../types';

export function ExportMenu(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const { t: tp }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const toast: ToastApi = useToast();
    const exportPortfolio: UseMutationResult<void, ApiError, ExportPortfolioInput> = useExportPortfolio();
    const items: readonly DropdownItem[] = EXPORT_FORMATS.map((format: ExportFormat): DropdownItem => ({
        key: format,
        label: t(`export.${format}`),
        onSelect: (): void => {
            exportPortfolio.mutate(
                { format },
                {
                    onSuccess: (): void => {
                        toast.show({ tone: 'positive', title: t('toasts.exported') });
                    },
                    onError: (error: Error): void => {
                        toast.show({ tone: 'critical', title: exportErrorMessage(t, tp, error) });
                    }
                }
            );
        }
    }));
    return (
        <DropdownMenu
            items={items}
            trigger={
                <Button variant="secondary" loading={exportPortfolio.isPending}>
                    {exportPortfolio.isPending ? null : <Download className="size-4" aria-hidden="true" />}
                    {exportPortfolio.isPending ? t('export.exporting') : t('export.button')}
                </Button>
            }
        />
    );
}
