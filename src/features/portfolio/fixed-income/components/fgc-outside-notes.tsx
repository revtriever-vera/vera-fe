import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { useClasses } from '../../api/use-classes.query';
import { EditFixedIncomeModal } from '../../assets/components/edit-fixed-income-modal';
import type { AssetClassView, ClassesResponse } from '../../types';
import type { FgcOutside, FgcOutsideReason } from '../types';

const NOTE_REASONS: readonly Exclude<FgcOutsideReason, 'missing_issuer'>[] = [
    'tesouro',
    'not_covered_kind',
    'not_associated',
    'foreign',
    'not_calculated'
];

function OutsideNote({ reason, items }: { readonly reason: Exclude<FgcOutsideReason, 'missing_issuer'>; readonly items: readonly FgcOutside[] }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    if (items.length === 0) {
        return null;
    }
    const names: string = items.map((item: FgcOutside): string => item.name).join(', ');
    return (
        <p className="text-xs text-content-muted">
            {t('fgc.outside', { names })} {t(`fgc.reasons.${reason}`)}
        </p>
    );
}

function MissingIssuerNote({ items }: { readonly items: readonly FgcOutside[] }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const classes: ClassesResponse | undefined = useClasses().data;
    const [editing, setEditing] = useState<FgcOutside | null>(null);
    if (items.length === 0) {
        return null;
    }
    const names: string = items.map((item: FgcOutside): string => item.name).join(', ');
    const available: readonly AssetClassView[] = classes?.data ?? [];
    return (
        <div className="flex flex-col items-start gap-1">
            <p className="text-xs text-content-muted">{t('fgc.missingIssuer', { names })}</p>
            {items.map((item: FgcOutside): ReactElement => (
                <Button
                    key={item.id}
                    size="sm"
                    variant="secondary"
                    onClick={(): void => {
                        setEditing(item);
                    }}
                >
                    {t('fgc.completeIssuer', { name: item.name })}
                </Button>
            ))}
            {editing === null || classes === undefined ? null : (
                <EditFixedIncomeModal
                    titleId={editing.id}
                    name={editing.name}
                    focusIssuer
                    classes={available}
                    onClose={(): void => {
                        setEditing(null);
                    }}
                />
            )}
        </div>
    );
}

function groupByReason(outside: readonly FgcOutside[]): ReadonlyMap<FgcOutsideReason, readonly FgcOutside[]> {
    const groups: Map<FgcOutsideReason, FgcOutside[]> = new Map<FgcOutsideReason, FgcOutside[]>();
    for (const item of outside) {
        groups.set(item.reason, [...(groups.get(item.reason) ?? []), item]);
    }
    return groups;
}

export function FgcOutsideNotes({ outside }: { readonly outside: readonly FgcOutside[] }): ReactElement {
    const groups: ReadonlyMap<FgcOutsideReason, readonly FgcOutside[]> = groupByReason(outside);
    return (
        <div className="flex flex-col gap-2">
            {NOTE_REASONS.map((reason: Exclude<FgcOutsideReason, 'missing_issuer'>): ReactElement => (
                <OutsideNote key={reason} reason={reason} items={groups.get(reason) ?? []} />
            ))}
            <MissingIssuerNote items={groups.get('missing_issuer') ?? []} />
        </div>
    );
}
