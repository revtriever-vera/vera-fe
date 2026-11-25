import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { averageLine, quantityLine } from '../lib/effect-text';
import type { PositionModes } from '../lib/line-drafts';
import type { EffectRow } from '../lib/recalculate-effect';
import { POSITION_MODES, type PositionMode } from '../types';

type ModeValue = PositionMode | 'unset';

export interface EffectListProps {
    readonly rows: readonly EffectRow[];
    readonly modes?: PositionModes;
    readonly onMode?: (assetId: string, mode: PositionMode) => void;
}

interface ModeChoiceProps {
    readonly row: EffectRow;
    readonly value: PositionMode | undefined;
    readonly onMode: (assetId: string, mode: PositionMode) => void;
}

function ModeChoice({ row, value, onMode }: ModeChoiceProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const options: readonly SegmentedOption<ModeValue>[] = [
        { value: POSITION_MODES.add, label: t('effect.add') },
        { value: POSITION_MODES.historyOnly, label: t('effect.history') }
    ];
    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-sm text-content">{t('effect.existing', { ticker: row.ticker })}</p>
            <SegmentedControl<ModeValue>
                label={t('effect.choose', { ticker: row.ticker })}
                options={options}
                value={value ?? 'unset'}
                onChange={(next: ModeValue): void => {
                    if (next !== 'unset') {
                        onMode(row.assetId, next);
                    }
                }}
            />
        </div>
    );
}

function EffectItemView({ row, modes, onMode }: { readonly row: EffectRow } & Pick<EffectListProps, 'modes' | 'onMode'>): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const locale: SupportedLocale = useLocale();
    const average: string | null = averageLine(t, row, locale);
    return (
        <li className="flex flex-col gap-2 py-3">
            <p className="text-sm text-content">
                <span className="font-semibold">{quantityLine(t, row, locale)}</span>
                {average === null ? null : <span> {average}</span>}
            </p>
            {row.existingPosition && row.needsMode && onMode !== undefined ? (
                <ModeChoice row={row} value={modes?.[row.assetId]} onMode={onMode} />
            ) : null}
            {row.recalculated ? <p className="text-xs text-content-muted">{t('effect.recalculated')}</p> : null}
        </li>
    );
}

export function EffectList({ rows, modes, onMode }: EffectListProps): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    if (rows.length === 0) {
        return null;
    }
    return (
        <section className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-content">{t('effect.title')}</h3>
            <ul aria-label={t('effect.label')} className="flex flex-col divide-y divide-border">
                {rows.map((row: EffectRow): ReactElement => (
                    <EffectItemView key={row.assetId} row={row} modes={modes} onMode={onMode} />
                ))}
            </ul>
        </section>
    );
}
