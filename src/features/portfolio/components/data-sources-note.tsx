import type { ReactElement } from 'react';
import { Info } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';

export interface DataSourcesNoteProps {
    readonly className?: string;
}

const COINGECKO_URL: string = 'https://www.coingecko.com/';

export function DataSourcesNote({ className }: DataSourcesNoteProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    return (
        <aside aria-labelledby="portfolio-data-sources" className={cn('flex gap-2 text-xs text-content-muted', className)}>
            <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div className="flex flex-col gap-1">
                <h2 id="portfolio-data-sources" className="font-semibold text-content">
                    {t('dataSources.title')}
                </h2>
                <ul className="flex flex-col gap-0.5">
                    <li>{t('dataSources.b3')}</li>
                    <li>{t('dataSources.us')}</li>
                    <li>
                        {t('dataSources.crypto')}{' '}
                        <a
                            href={COINGECKO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-accent-strong underline"
                        >
                            {t('dataSources.coingeckoLink')}
                        </a>
                    </li>
                    <li>{t('dataSources.exchange')}</li>
                    <li>{t('dataSources.treasury')}</li>
                    <li>{t('dataSources.series')}</li>
                    <li>{t('dataSources.estimate')}</li>
                </ul>
            </div>
        </aside>
    );
}
