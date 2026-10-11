import type { ReactElement } from 'react';
import { Upload } from 'lucide-react';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { ImportHistory } from './import-history';

export function ImportCard(): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const navigate: UseNavigateResult<string> = useNavigate();
    const open = (): void => {
        void navigate({ to: '.', search: (previous: Record<string, unknown>): Record<string, unknown> => ({ ...previous, import: true }) });
    };
    return (
        <Card className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <h2 className="text-base font-semibold text-content">{t('card.title')}</h2>
                    <p className="text-sm text-content-muted">{t('card.description')}</p>
                </div>
                <Button onClick={open}>
                    <Upload className="size-4" aria-hidden="true" />
                    {t('card.button')}
                </Button>
            </div>
            <ImportHistory />
        </Card>
    );
}
