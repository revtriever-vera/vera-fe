import { useEffect, useState, type ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button, buttonVariants } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { SearchInput } from '@/shared/ui/search-input';
import type { RuleView, RulesResponse } from '../../types';
import { useRules } from '../api/use-rules.query';
import { ruleDomId, ruleLabel, ruleMatchesSearch } from '../lib/rule-labels';
import { DeleteRuleDialog } from './delete-rule-dialog';
import { NewRuleModal } from './new-rule-modal';
import { RulesList } from './rules-list';

const HIGHLIGHT_MS: number = 4000;

function newestFirst(a: RuleView, b: RuleView): number {
    return b.createdAt.localeCompare(a.createdAt);
}

interface Highlight {
    readonly id: string | null;
    readonly show: (id: string) => void;
}

function useHighlight(): Highlight {
    const [id, setId] = useState<string | null>(null);
    useEffect((): (() => void) | undefined => {
        if (id === null) {
            return undefined;
        }
        document.getElementById(ruleDomId(id))?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
            setId(null);
        }, HIGHLIGHT_MS);
        return (): void => {
            clearTimeout(timer);
        };
    }, [id]);
    return { id, show: setId };
}

function EmptyRules(): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    return (
        <EmptyState
            title={t('rules.empty.title')}
            description={t('rules.empty.description')}
            action={
                <Link to="/spending/transactions" search={{ uncategorized: true }} className={buttonVariants({ variant: 'secondary' })}>
                    {t('rules.empty.link')}
                </Link>
            }
        />
    );
}

function RulesBody({
    query,
    search,
    highlightedId,
    onDelete
}: {
    readonly query: UseQueryResult<RulesResponse>;
    readonly search: string;
    readonly highlightedId: string | null;
    readonly onDelete: (rule: RuleView) => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    if (query.isPending) {
        return (
            <Loading label={t('rules.loading')} className="flex flex-col gap-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </Loading>
        );
    }
    if (query.isError) {
        return <FailureAlert error={query.error} title={t('rules.loadFailed')} />;
    }
    if (query.data.rules.length === 0) {
        return <EmptyRules />;
    }
    const visible: readonly RuleView[] = [...query.data.rules]
        .sort(newestFirst)
        .filter((rule: RuleView): boolean => ruleMatchesSearch(ruleLabel(t, rule), search));
    if (visible.length === 0) {
        return <p className="text-sm text-content-muted">{t('rules.noMatch')}</p>;
    }
    return <RulesList rules={visible} highlightedId={highlightedId} onDelete={onDelete} />;
}

function RulesHeader({ onNew }: { readonly onNew: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    return (
        <header className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
                <h2 id="rules-title" className="text-lg font-bold">
                    {t('rules.title')}
                </h2>
                <p className="max-w-prose text-sm text-content-muted">{t('rules.description')}</p>
            </div>
            <Button onClick={onNew}>
                <Plus className="size-4" aria-hidden="true" />
                {t('rules.new')}
            </Button>
        </header>
    );
}

export function RulesSection(): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const query: UseQueryResult<RulesResponse> = useRules();
    const [search, setSearch] = useState<string>('');
    const [creating, setCreating] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<RuleView | null>(null);
    const highlight: Highlight = useHighlight();
    return (
        <section aria-labelledby="rules-title" className="flex flex-col gap-4">
            <RulesHeader
                onNew={(): void => {
                    setCreating(true);
                }}
            />
            <SearchInput value={search} onChange={setSearch} placeholder={t('rules.searchPlaceholder')} label={t('rules.searchLabel')} />
            <RulesBody query={query} search={search} highlightedId={highlight.id} onDelete={setDeleting} />
            {creating ? (
                <NewRuleModal
                    onClose={(): void => {
                        setCreating(false);
                    }}
                    onSeeRule={(id: string): void => {
                        setCreating(false);
                        setSearch('');
                        highlight.show(id);
                    }}
                />
            ) : null}
            {deleting === null ? null : (
                <DeleteRuleDialog
                    rule={deleting}
                    onClose={(): void => {
                        setDeleting(null);
                    }}
                />
            )}
        </section>
    );
}
