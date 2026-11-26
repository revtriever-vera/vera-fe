import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { LINE_KIND, LINE_STATUS, type PreviewLine } from '../types';
import type { LineDraft } from '../lib/line-drafts';
import { IncomeList } from './income-list';
import { OperationLineCard } from './operation-line-card';

export interface OperationsTableProps {
    readonly lines: readonly PreviewLine[];
    readonly drafts: Readonly<Record<string, LineDraft>>;
    readonly onEdit: (lineId: string, patch: Partial<LineDraft>) => void;
}

function isIncome(line: PreviewLine): boolean {
    return line.kind === LINE_KIND.income;
}

function isImportable(line: PreviewLine): boolean {
    return line.status !== LINE_STATUS.duplicate && line.status !== LINE_STATUS.ignored;
}

export function OperationsTable({ lines, drafts, onEdit }: OperationsTableProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const importable: readonly PreviewLine[] = lines.filter(isImportable);
    const operations: readonly PreviewLine[] = importable.filter((line: PreviewLine): boolean => !isIncome(line));
    const income: readonly PreviewLine[] = importable.filter(isIncome);
    const left: number = lines.length - importable.length;
    return (
        <section className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-content">{t('table.title')}</h3>
            {operations.length === 0 ? <p className="text-sm text-content-muted">{t('table.empty')}</p> : null}
            <ul aria-label={t('table.label')} className="flex flex-col gap-3">
                {operations.map((line: PreviewLine): ReactElement => (
                    <OperationLineCard key={line.lineId} line={line} draft={drafts[line.lineId]} onEdit={onEdit} />
                ))}
            </ul>
            {income.length === 0 ? null : <IncomeList lines={income} />}
            {left === 0 ? null : <p className="text-sm text-content-muted">{t('table.otherLines', { count: left })}</p>}
        </section>
    );
}
