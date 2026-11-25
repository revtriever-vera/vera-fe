import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Badge, type BadgeProps } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { DateField } from '@/shared/ui/date-field';
import { Field } from '@/shared/ui/field';
import { MoneyInput } from '@/shared/ui/money-input';
import { cn } from '@/shared/lib/cn';
import { LINE_REASON, LINE_STATUS, type LineStatus, type PreviewLine } from '../types';
import { lineBlocked, tickerOf, draftFieldInvalid, type LineDraft, type PickedAsset } from '../lib/line-drafts';
import { lineReasonText } from '../lib/line-reason';
import { CatalogPicker } from './catalog-picker';

const DEFAULT_CURRENCY: string = 'BRL';

const STATUS_TONES: Readonly<Record<LineStatus, NonNullable<BadgeProps['tone']>>> = {
    ok: 'positive',
    check: 'caution',
    blocked: 'critical',
    duplicate: 'neutral',
    ignored: 'neutral'
};

export interface OperationLineCardProps {
    readonly line: PreviewLine;
    readonly draft: LineDraft | undefined;
    readonly onEdit: (lineId: string, patch: Partial<LineDraft>) => void;
}

function shownStatus(line: PreviewLine, draft: LineDraft | undefined): LineStatus {
    if (line.status === LINE_STATUS.blocked && !lineBlocked(line, draft)) {
        return LINE_STATUS.ok;
    }
    return line.status;
}

function LineHeader({
    line,
    draft,
    headingId
}: Pick<OperationLineCardProps, 'line' | 'draft'> & { readonly headingId: string }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const status: LineStatus = shownStatus(line, draft);
    return (
        <div className="flex flex-wrap items-center gap-2">
            <h4 id={headingId} className="text-sm font-semibold text-content">
                {tickerOf(line, draft) ?? t('table.unnamedAsset')}
            </h4>
            {line.kind === null ? null : <Badge>{t(`kinds.${line.kind}`)}</Badge>}
            <Badge tone={STATUS_TONES[status]}>{t(`status.${status}`)}</Badge>
        </div>
    );
}

function DecimalField({ line, draft, onEdit, field }: OperationLineCardProps & { readonly field: 'quantity' | 'unitPrice' }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const label: string = field === 'quantity' ? t('table.quantity') : t('table.unitPrice');
    return (
        <Field
            id={`${line.lineId}-${field}`}
            label={label}
            inputMode="decimal"
            autoComplete="off"
            value={draft?.[field] ?? line[field] ?? ''}
            error={draftFieldInvalid(draft, field) ? t('table.decimalInvalid') : undefined}
            onChange={(event): void => {
                onEdit(line.lineId, { [field]: event.target.value });
            }}
        />
    );
}

function LineFields({ line, draft, onEdit }: OperationLineCardProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DecimalField line={line} draft={draft} onEdit={onEdit} field="quantity" />
            <DecimalField line={line} draft={draft} onEdit={onEdit} field="unitPrice" />
            <DateField
                label={t('table.tradeDate')}
                value={draft?.tradeDate ?? line.tradeDate}
                onChange={(iso: string | null): void => {
                    onEdit(line.lineId, { tradeDate: iso ?? undefined });
                }}
            />
            <MoneyInput
                label={t('table.fees')}
                value={draft?.feesMinor ?? line.feesMinor ?? 0}
                currency={line.currency ?? DEFAULT_CURRENCY}
                onChange={(minor: number | null): void => {
                    onEdit(line.lineId, { feesMinor: minor ?? 0 });
                }}
            />
        </div>
    );
}

function AssetSearch({ line, draft, onEdit }: OperationLineCardProps): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const [open, setOpen] = useState<boolean>(false);
    const needsAsset: boolean = line.reason === LINE_REASON.assetNotFound || line.reason === LINE_REASON.assetNotAvailable;
    if (!needsAsset) {
        return null;
    }
    if (open) {
        return (
            <CatalogPicker
                onPick={(asset: PickedAsset): void => {
                    onEdit(line.lineId, { asset });
                    setOpen(false);
                }}
                onCancel={(): void => {
                    setOpen(false);
                }}
            />
        );
    }
    return (
        <Button
            variant="secondary"
            size="sm"
            className="self-start"
            onClick={(): void => {
                setOpen(true);
            }}
        >
            {draft?.asset === undefined ? t('actions.searchAsset') : t('actions.changeAsset')}
        </Button>
    );
}

function ReasonText({ line, draft }: Pick<OperationLineCardProps, 'line' | 'draft'>): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    if (draft?.skip === true) {
        return <p className="text-sm text-content-muted">{t('table.skipped')}</p>;
    }
    const attention: boolean = line.status === LINE_STATUS.blocked || line.status === LINE_STATUS.check;
    if (!attention || line.reason === null) {
        return null;
    }
    const open: boolean = lineBlocked(line, draft) || line.status === LINE_STATUS.check;
    return <p className={cn('text-sm', open ? 'text-content' : 'text-content-muted')}>{lineReasonText(t, line.reason)}</p>;
}

export function OperationLineCard({ line, draft, onEdit }: OperationLineCardProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const headingId: string = `${line.lineId}-heading`;
    const skipped: boolean = draft?.skip === true;
    const highlighted: boolean = !skipped && (line.status === LINE_STATUS.check || lineBlocked(line, draft));
    return (
        <li className={cn('rounded-card border bg-surface p-3', highlighted ? 'border-caution bg-caution/5' : 'border-border')}>
            <fieldset aria-labelledby={headingId} className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
                <LineHeader line={line} draft={draft} headingId={headingId} />
                <div className={cn('flex flex-col gap-3', skipped && 'opacity-60')}>
                    <ReasonText line={line} draft={draft} />
                    <LineFields line={line} draft={draft} onEdit={onEdit} />
                    <AssetSearch line={line} draft={draft} onEdit={onEdit} />
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="self-start"
                    onClick={(): void => {
                        onEdit(line.lineId, { skip: !skipped });
                    }}
                >
                    {skipped ? t('actions.unskipLine') : t('actions.skipLine')}
                </Button>
            </fieldset>
        </li>
    );
}
