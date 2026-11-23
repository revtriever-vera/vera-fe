import type { ReactElement, ReactNode } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Badge } from '@/shared/ui/badge';

export interface FixedIncomeCardProps {
    readonly title: string;
    readonly description: string;
    readonly showBrlNote: boolean;
    readonly children: ReactNode;
}

export function FixedIncomeCard({ title, description, showBrlNote, children }: FixedIncomeCardProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    return (
        <section aria-label={title} className="surface-card flex flex-col gap-4 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="text-base font-semibold">{title}</h3>
                    <p className="max-w-3xl text-sm text-content-muted">{description}</p>
                </div>
                {showBrlNote ? <Badge>{t('common.brlOnly')}</Badge> : null}
            </div>
            {children}
        </section>
    );
}
