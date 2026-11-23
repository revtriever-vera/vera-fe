import type { ReactElement } from 'react';
import { Check, Minus, type LucideIcon } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';

interface CompareRow {
    readonly key: 'wallet' | 'spending' | 'cuts' | 'export' | 'summaries' | 'whatsapp' | 'calendar';
    readonly free: boolean;
}

const ROWS: readonly CompareRow[] = [
    { key: 'wallet', free: true },
    { key: 'spending', free: true },
    { key: 'cuts', free: true },
    { key: 'export', free: true },
    { key: 'summaries', free: false },
    { key: 'whatsapp', free: false },
    { key: 'calendar', free: false }
];

function Mark({ included }: { readonly included: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const Icon: LucideIcon = included ? Check : Minus;
    return (
        <span className={included ? 'text-positive' : 'text-content-subtle'}>
            <Icon className="mx-auto size-4" aria-hidden="true" />
            <span className="sr-only">{t(included ? 'planTab.compare.included' : 'planTab.compare.notIncluded')}</span>
        </span>
    );
}

function CompareLine({ row }: { readonly row: CompareRow }): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    return (
        <tr className="border-b border-border last:border-0">
            <th scope="row" className="py-2 pr-3 text-left font-normal text-content">
                {t(`planTab.compare.rows.${row.key}`)}
            </th>
            <td className="py-2 text-center">
                <Mark included={row.free} />
            </td>
            <td className="py-2 text-center">
                <Mark included />
            </td>
        </tr>
    );
}

export function PlanCompareTable(): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    return (
        <Card className="flex flex-col gap-3">
            <h2 className="m-0 text-base font-semibold text-content">{t('planTab.compare.title')}</h2>
            <div className="overflow-x-auto">
                <table aria-label={t('planTab.compare.label')} className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border text-left text-xs text-content-subtle">
                            <th scope="col" className="py-2 pr-3 font-medium">
                                {t('planTab.compare.feature')}
                            </th>
                            <th scope="col" className="w-20 py-2 text-center font-medium">
                                {t('planTab.cards.freeLabel')}
                            </th>
                            <th scope="col" className="w-20 py-2 text-center font-medium">
                                {t('planTab.cards.premiumLabel')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {ROWS.map((row: CompareRow): ReactElement => (
                            <CompareLine key={row.key} row={row} />
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="m-0 text-xs text-content-muted">{t('planTab.compare.note')}</p>
        </Card>
    );
}
