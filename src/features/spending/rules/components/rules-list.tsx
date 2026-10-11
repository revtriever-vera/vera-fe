import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { Table, type TableColumn } from '@/shared/ui/table';
import type { RuleView } from '../../types';
import { ruleAppliesToLabel, ruleTypeLabel } from '../lib/rule-labels';
import { HIGHLIGHT_CLASS, RuleCard, RuleCategoryCell, RuleDeleteButton, RuleName } from './rule-row';

export interface RulesListProps {
    readonly rules: readonly RuleView[];
    readonly highlightedId: string | null;
    readonly onDelete: (rule: RuleView) => void;
}

const MIN_WIDTH: string = 'min-w-[44rem]';
const WIDE_QUERY: string = '(min-width: 768px)';

function useColumns(onDelete: (rule: RuleView) => void): readonly TableColumn<RuleView>[] {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const locale: SupportedLocale = useLocale();
    return [
        { key: 'rule', header: t('rules.columns.rule'), render: (rule: RuleView): ReactElement => <RuleName rule={rule} /> },
        { key: 'type', header: t('rules.columns.type'), render: (rule: RuleView): string => ruleTypeLabel(t, rule.matchType) },
        {
            key: 'appliesTo',
            header: t('rules.columns.appliesTo'),
            render: (rule: RuleView): string => ruleAppliesToLabel(t, rule.appliesTo)
        },
        {
            key: 'category',
            header: t('rules.columns.category'),
            render: (rule: RuleView): ReactElement => <RuleCategoryCell rule={rule} />
        },
        { key: 'date', header: t('rules.columns.date'), render: (rule: RuleView): string => formatIsoDate(rule.createdAt, locale) },
        {
            key: 'actions',
            header: t('rules.columns.actions'),
            align: 'right',
            render: (rule: RuleView): ReactElement => <RuleDeleteButton rule={rule} onDelete={onDelete} />
        }
    ];
}

export function RulesList({ rules, highlightedId, onDelete }: RulesListProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const wide: boolean = useMediaQuery(WIDE_QUERY);
    const columns: readonly TableColumn<RuleView>[] = useColumns(onDelete);
    if (wide) {
        return (
            <Table
                label={t('rules.listLabel')}
                columns={columns}
                rows={rules}
                rowKey={(rule: RuleView): string => rule.id}
                minWidthClass={MIN_WIDTH}
                rowClassName={(rule: RuleView): string | undefined => (rule.id === highlightedId ? HIGHLIGHT_CLASS : undefined)}
            />
        );
    }
    return (
        <ul aria-label={t('rules.listLabel')} className="flex flex-col gap-3">
            {rules.map((rule: RuleView): ReactElement => (
                <RuleCard key={rule.id} rule={rule} onDelete={onDelete} highlighted={rule.id === highlightedId} />
            ))}
        </ul>
    );
}
