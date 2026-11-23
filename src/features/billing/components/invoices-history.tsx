import { useState, type ReactElement } from 'react';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { openPaymentLink } from '@/shared/lib/billing/open-payment-link';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Pager } from '@/shared/ui/pager';
import { SkeletonPanel } from '@/shared/ui/skeleton-form';
import { Table, type TableColumn } from '@/shared/ui/table';
import { useInvoicePaymentLink } from '../api/use-invoice-payment-link.mutation';
import { useInvoices } from '../api/use-invoices.query';
import { shortDate } from '../lib/billing-format';
import { INVOICES_PAGE_SIZE, type InvoiceRow, type InvoicesPage, type PaymentLink } from '../types';

type Translate = UseTranslationResponse<'billing', undefined>['t'];

const STATUS_TONE: Readonly<Record<InvoiceRow['status'], 'positive' | 'caution' | 'critical'>> = {
    paid: 'positive',
    issued: 'caution',
    overdue: 'critical'
};

function textColumns(t: Translate, locale: SupportedLocale): readonly TableColumn<InvoiceRow>[] {
    return [
        {
            key: 'date',
            header: t('planTab.history.date'),
            render: (row: InvoiceRow): string => shortDate(row.paidAt ?? row.dueDate ?? row.cycleStart ?? '', locale)
        },
        {
            key: 'amount',
            header: t('planTab.history.amount'),
            render: (row: InvoiceRow): string => (row.totalCents === null ? '-' : formatCurrency(row.totalCents, 'BRL', locale))
        },
        {
            key: 'method',
            header: t('planTab.history.method'),
            render: (row: InvoiceRow): string => (row.method === null ? '-' : t(`planTab.history.methods.${row.method}`))
        }
    ];
}

function columnsOf(
    t: Translate,
    locale: SupportedLocale,
    busy: boolean,
    onView: (row: InvoiceRow) => void
): readonly TableColumn<InvoiceRow>[] {
    return [
        ...textColumns(t, locale),
        {
            key: 'status',
            header: t('planTab.history.status'),
            render: (row: InvoiceRow): ReactElement => (
                <Badge tone={STATUS_TONE[row.status]}>{t(`planTab.history.statuses.${row.status}`)}</Badge>
            )
        },
        {
            key: 'view',
            header: '',
            align: 'right',
            render: (row: InvoiceRow): ReactElement => (
                <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={(): void => {
                        onView(row);
                    }}
                >
                    {t('planTab.history.view')}
                </Button>
            )
        }
    ];
}

function useViewInvoice(): { readonly view: (row: InvoiceRow) => void; readonly busy: boolean } {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const toast: ToastApi = useToast();
    const link: UseMutationResult<PaymentLink, Error, string> = useInvoicePaymentLink();
    const { mutateAsync } = link;
    return {
        busy: link.isPending,
        view: (row: InvoiceRow): void => {
            track('invoice_viewed');
            openPaymentLink(async (): Promise<string> => (await mutateAsync(row.id)).url).catch((): void => {
                toast.show({ tone: 'critical', title: t('toast.payFailed') });
            });
        }
    };
}

function InvoicesTable({
    page,
    data,
    onPage
}: {
    readonly page: number;
    readonly data: InvoicesPage;
    readonly onPage: (page: number) => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const { view, busy } = useViewInvoice();
    return (
        <>
            {data.items.length === 0 ? (
                <p className="m-0 text-sm text-content-muted">{t('planTab.history.empty')}</p>
            ) : (
                <Table
                    label={t('planTab.history.label')}
                    columns={columnsOf(t, locale, busy, view)}
                    rows={data.items}
                    rowKey={(row: InvoiceRow): string => row.id}
                />
            )}
            <div className="flex justify-end text-sm">
                <Pager page={page} totalPages={Math.ceil(data.total / INVOICES_PAGE_SIZE)} onChange={onPage} />
            </div>
        </>
    );
}

export function InvoicesHistory(): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const [page, setPage] = useState<number>(1);
    const query: UseQueryResult<InvoicesPage> = useInvoices(page);
    if (query.isPending) {
        return <SkeletonPanel label={t('planTab.history.loading')} lines={3} />;
    }
    if (query.isError) {
        return <Alert title={t('planTab.history.failed')} />;
    }
    return (
        <section aria-label={t('planTab.history.title')} className="flex flex-col gap-3">
            <h2 className="m-0 text-base font-semibold text-content">{t('planTab.history.title')}</h2>
            <InvoicesTable page={page} data={query.data} onPage={setPage} />
        </section>
    );
}
