import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { Target, Zap } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { buttonVariants } from '@/shared/ui/button';
import { formatPpMagnitudeBps } from '../../lib/format-bps';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import { DEVIATION_STATUS } from '../../types';
import type { Callout } from '../lib/overview-view-model';

export interface LargestDeviationCalloutProps {
    readonly callout: Callout;
}

export function LargestDeviationCallout({ callout }: LargestDeviationCalloutProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    const locale: SupportedLocale = useLocale();
    const label: ClassLabel = useClassLabel();
    const values: { readonly name: string; readonly pp: string } = {
        name: label(callout.systemKey, callout.name),
        pp: formatPpMagnitudeBps(callout.deviationBps, locale)
    };
    return (
        <div className="flex flex-col gap-3 rounded-card bg-accent-soft p-3 text-sm min-[480px]:flex-row min-[480px]:items-center">
            <span className="flex items-center gap-2 text-accent-strong">
                <Target aria-hidden="true" className="size-4 shrink-0" />
                <span>{callout.status === DEVIATION_STATUS.above ? t('callout.above', values) : t('callout.below', values)}</span>
            </span>
            <Link to="/portfolio/contribution" className={buttonVariants({ size: 'sm', className: 'min-[480px]:ml-auto' })}>
                <Zap aria-hidden="true" className="size-3.5" />
                {t('callout.action')}
            </Link>
        </div>
    );
}
