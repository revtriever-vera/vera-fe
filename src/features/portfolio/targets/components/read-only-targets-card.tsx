import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Card } from '@/shared/ui/card';
import { formatTargetBps } from '../../lib/format-bps';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { AssetClassView } from '../../types';
import { sortedClasses } from '../lib/targets-form';

export function ReadOnlyTargetsCard({ classes }: { readonly classes: readonly AssetClassView[] }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const locale: SupportedLocale = useLocale();
    const label: ClassLabel = useClassLabel();

    return (
        <Card className="flex flex-col gap-4">
            <div>
                <h3 className="text-base font-semibold">{t('targets.title')}</h3>
                <p className="text-sm text-content-muted">{t('targets.viewerDescription')}</p>
            </div>
            <ul aria-label={t('targets.listLabel')} className="divide-y divide-border">
                {sortedClasses(classes).map((item: AssetClassView): ReactElement => (
                    <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <span className="min-w-0 truncate font-semibold">{label(item.systemKey, item.name)}</span>
                        <span className="tabular-nums text-content-muted">{formatTargetBps(item.targetBps, locale)}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
