import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Card } from '@/shared/ui/card';
import { ResponsiveRows } from '@/shared/ui/responsive-rows';
import type { TableColumn } from '@/shared/ui/table';
import type { AccountPerson, AccountSummary } from '../types';
import { AccountSections } from './account-sections';

function Fact({ label, value }: { readonly label: string; readonly value: string }): ReactElement {
    return (
        <div className="flex flex-col">
            <dt className="text-xs text-content-muted">{label}</dt>
            <dd className="text-sm font-semibold">{value}</dd>
        </div>
    );
}

function AccountFacts({ summary }: { readonly summary: AccountSummary }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const locale: SupportedLocale = useLocale();
    const { account }: AccountSummary = summary;
    const plan: string = t(account.plan === 'premium' ? 'planPremium' : 'planFree');
    return (
        <Card className="p-4">
            <dl className="grid gap-3 sm:grid-cols-3">
                <Fact label={t('accountColumnName')} value={account.name} />
                <Fact label={t('accountColumnPlan')} value={account.planSource === null ? plan : `${plan} (${account.planSource})`} />
                <Fact label={t('accountColumnCreated')} value={formatDate(new Date(account.createdAt), locale, 'UTC')} />
                <Fact label={t('summaryLocale')} value={summary.locale} />
                <Fact label={t('summaryTimezone')} value={summary.timezone} />
                {account.trialEndsAt === null ? null : (
                    <Fact label={t('summaryTrialEnds')} value={formatDate(new Date(account.trialEndsAt), locale, 'UTC')} />
                )}
            </dl>
        </Card>
    );
}

function People({ people }: { readonly people: readonly AccountPerson[] }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const locale: SupportedLocale = useLocale();
    const columns: readonly TableColumn<AccountPerson>[] = [
        { key: 'name', header: t('personName'), render: (person: AccountPerson): string => person.name },
        { key: 'email', header: t('personEmail'), render: (person: AccountPerson): string => person.email },
        { key: 'role', header: t('personRole'), render: (person: AccountPerson): string => person.role },
        {
            key: 'joinedAt',
            header: t('personJoined'),
            render: (person: AccountPerson): string => formatDate(new Date(person.joinedAt), locale, 'UTC')
        }
    ];
    return (
        <section className="flex flex-col gap-2" aria-label={t('summaryPeople')}>
            <h3 className="text-sm font-semibold">{t('summaryPeople')}</h3>
            <ResponsiveRows
                label={t('summaryPeople')}
                columns={columns}
                rows={people}
                rowKey={(person: AccountPerson): string => person.id}
            />
        </section>
    );
}

export function AccountSummaryView({ summary }: { readonly summary: AccountSummary }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold tracking-tight">{t('summaryTitle')}</h2>
            <AccountFacts summary={summary} />
            <People people={summary.people} />
            <AccountSections
                title={t('summaryBilling')}
                sections={{ billing: summary.billing, offer: summary.offer, usage: summary.usage }}
            />
        </div>
    );
}
