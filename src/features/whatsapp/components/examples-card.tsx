import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { buttonVariants } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EXAMPLE_KEYS, type ExampleKey } from '../types';

export function ExamplesCard({ veraNumber }: { readonly veraNumber: string | null }): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    return (
        <Card className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-content">{t('examples.title')}</h2>
                {veraNumber === null ? null : (
                    <a
                        href={`https://wa.me/${veraNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(): void => {
                            track('whatsapp_open_clicked');
                        }}
                        className={buttonVariants({ size: 'sm' })}
                    >
                        {t('examples.open')}
                    </a>
                )}
            </div>
            <ul className="flex flex-col gap-1.5 text-sm text-content">
                {EXAMPLE_KEYS.map((key: ExampleKey): ReactElement => (
                    <li key={key}>{t(`examples.items.${key}`)}</li>
                ))}
            </ul>
            <p className="text-xs text-content-muted">{t('examples.noPayments')}</p>
        </Card>
    );
}
