import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import { humanizeKey } from '../lib/account-data-view';
import { DataValue } from './data-value';

export interface AccountSectionsProps {
    readonly title: string;
    readonly sections: Readonly<Record<string, unknown>>;
}

export function AccountSections({ title, sections }: AccountSectionsProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const entries: [string, unknown][] = Object.entries(sections);
    return (
        <section className="flex flex-col gap-3" aria-label={title}>
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
            {entries.length === 0 ? <p className="text-sm text-content-muted">{t('valueEmpty')}</p> : null}
            {entries.map(([area, value]: [string, unknown]): ReactElement => (
                <Card key={area} className="flex flex-col gap-2 p-4">
                    <h3 className="text-sm font-semibold">{humanizeKey(area)}</h3>
                    <DataValue value={value} />
                </Card>
            ))}
        </section>
    );
}
