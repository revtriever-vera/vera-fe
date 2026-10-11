import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { CircleHelp } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { buttonVariants } from '@/shared/ui/button';
import type { CutsResponse } from '../../types';
import { formatWhole } from '../lib/format-reais';

export function UncategorizedNote({ cuts }: { readonly cuts: CutsResponse }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const locale: SupportedLocale = useLocale();
    if (cuts.uncategorizedMinor <= 0) {
        return null;
    }
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-caution/30 bg-caution-soft p-4">
            <p className="flex items-center gap-2 text-sm">
                <CircleHelp className="size-4 shrink-0 text-caution" aria-hidden="true" />
                {t('uncategorized.text', { amount: formatWhole(cuts.uncategorizedMinor, locale) })}
            </p>
            <Link
                to="/spending/transactions"
                search={{ month: cuts.month, uncategorized: true }}
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
                {t('uncategorized.action')}
            </Link>
        </div>
    );
}
