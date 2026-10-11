import type { ReactElement } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { formatMonthTitle } from '../lib/format-month';

export interface MonthSwitcherProps {
    readonly month: string;
    readonly previousMonth: string | null;
    readonly nextMonth: string | null;
    readonly isPartial: boolean;
    readonly onChange: (month: string) => void;
}

const ARROW: string =
    'grid size-9 place-items-center rounded-control border border-border bg-surface text-content transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40';

interface ArrowProps {
    readonly label: string;
    readonly target: string | null;
    readonly icon: ReactElement;
    readonly onChange: (month: string) => void;
}

function Arrow({ label, target, icon, onChange }: ArrowProps): ReactElement {
    return (
        <button
            type="button"
            aria-label={label}
            disabled={target === null}
            className={ARROW}
            onClick={(): void => {
                if (target !== null) {
                    onChange(target);
                }
            }}
        >
            {icon}
        </button>
    );
}

export function MonthSwitcher({ month, previousMonth, nextMonth, isPartial, onChange }: MonthSwitcherProps): ReactElement {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const locale: SupportedLocale = useLocale();
    return (
        <div role="group" aria-label={t('month.label')} className="flex flex-wrap items-center gap-2">
            <Arrow
                label={t('month.previous')}
                target={previousMonth}
                icon={<ChevronLeft className="size-4" aria-hidden="true" />}
                onChange={onChange}
            />
            <span aria-live="polite" className="min-w-36 text-center text-base font-bold">
                {formatMonthTitle(month, locale)}
            </span>
            <Arrow
                label={t('month.next')}
                target={nextMonth}
                icon={<ChevronRight className="size-4" aria-hidden="true" />}
                onChange={onChange}
            />
            {isPartial ? <Badge tone="caution">{t('month.partial')}</Badge> : null}
        </div>
    );
}
