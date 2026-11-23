import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { RecurringOverview } from '@/features/spending/recurring/types';
import type { TransactionView } from '@/features/spending/types';
import { problem, sessionIdentity } from '../../../../../test/fixtures/auth';
import { confirmedLight, recurringAlert, recurringOverview } from '../../../../../test/fixtures/recurring';
import { canonicalCuts } from '../../../../../test/fixtures/spending';
import { installCutsApi } from '../../../../../test/helpers/cuts-api';
import { mockTransactionsApi } from '../../../../../test/helpers/transactions-api';
import { server } from '../../../../../test/msw/server';
import { renderRouterAt } from '../../../../../test/router';
import { canonicalSummary, transactionView, emptyTransactions } from '../../../../../test/fixtures/spending';

function serve(overview: RecurringOverview): void {
    server.use(http.get('*/spending/recurring', () => HttpResponse.json(overview)));
}

function asRole(role: 'editor' | 'viewer'): void {
    server.use(http.get('*/auth/me', () => HttpResponse.json(sessionIdentity({ role }))));
}

function withSubscriptions(): RecurringOverview {
    const base: RecurringOverview = recurringOverview();
    return {
        ...base,
        totals: { ...base.totals, monthlyMinor: 128400, byKind: { subscription: 31200, bill: 97200, other: 0 } },
        alerts: [recurringAlert(), recurringAlert({ id: '00000000-0000-4000-8000-0000000000a2' })]
    };
}

describe('Resumo do mês: card de recorrências', () => {
    it('mostra o total por mês, as sugestões e leva para a tela', async () => {
        server.use(http.get('*/spending/summary', () => HttpResponse.json(canonicalSummary())));
        serve(withSubscriptions());
        renderRouterAt('/spending', { signedIn: true });

        const card: HTMLElement = await screen.findByRole('region', { name: 'Assinaturas e contas' });
        expect(within(card).getByText(/R\$\s1\.284,00 por mês · 1 para revisar/)).toBeInTheDocument();
        expect(within(card).getByRole('link', { name: 'Ver assinaturas e contas' })).toHaveAttribute('href', '/spending/recurring');
    });

    it('sem série e sem sugestão, o card não aparece', async () => {
        server.use(http.get('*/spending/summary', () => HttpResponse.json(canonicalSummary())));
        renderRouterAt('/spending', { signedIn: true });

        await screen.findByText('Setembro de 2026');
        expect(screen.queryByRole('region', { name: 'Assinaturas e contas' })).not.toBeInTheDocument();
    });
});

describe('Onde cortar: nota de assinaturas', () => {
    it('soma as assinaturas e conta os aumentos de preço', async () => {
        installCutsApi({ override: canonicalCuts('goal20') });
        serve(withSubscriptions());
        renderRouterAt('/spending/cuts?month=2026-09', { signedIn: true });

        expect(await screen.findByText(/Assinaturas somam R\$\s312,00 por mês\. 2 subiram de preço\./)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver assinaturas e contas' })).toHaveAttribute('href', '/spending/recurring');
    });

    it('sem assinaturas confirmadas, não mostra a nota', async () => {
        installCutsApi({ override: canonicalCuts('goal20') });
        serve({ ...recurringOverview(), confirmed: [confirmedLight()] });
        renderRouterAt('/spending/cuts?month=2026-09', { signedIn: true });

        await screen.findByRole('slider', { name: 'Meta de economia' });
        await waitFor((): void => {
            expect(screen.queryByText(/Assinaturas somam/)).not.toBeInTheDocument();
        });
    });
});

describe('Transações: selo e Marcar como recorrente', () => {
    const PATH: string = '/spending/transactions?month=2026-09';

    function seed(): void {
        const data: TransactionView[] = [
            transactionView({ id: 'tx-rec', description: 'NETFLIX.COM', amountMinor: -5590, isRecurring: true }),
            transactionView({ id: 'tx-out', description: 'ACADEMIA SMART', amountMinor: -12000, categoryId: null }),
            transactionView({ id: 'tx-in', description: 'SALARIO', amountMinor: 500000 })
        ];
        mockTransactionsApi({
            transactions: {
                ...emptyTransactions(),
                data,
                pagination: { page: 1, pageSize: 50, totalRecords: 3, totalPages: 1 },
                totals: { inMinor: 500000, outMinor: -17590, count: 3 }
            }
        });
    }

    it('mostra o selo só na transação de série confirmada e a ação só nas saídas soltas', async () => {
        seed();
        renderRouterAt(PATH, { signedIn: true });
        await screen.findByText('NETFLIX.COM');

        expect(screen.getAllByText('Recorrente')).toHaveLength(1);
        expect(screen.getAllByRole('button', { name: 'Marcar como recorrente' })).toHaveLength(1);
    });

    it('marca a transação e avisa', async () => {
        seed();
        const bodies: unknown[] = [];
        server.use(
            http.post('*/spending/recurring', async ({ request }) => {
                bodies.push(await request.json());
                return HttpResponse.json({ ...confirmedLight(), name: 'Academia Smart' }, { status: 201 });
            })
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await screen.findByText('ACADEMIA SMART');

        await user.click(screen.getByRole('button', { name: 'Marcar como recorrente' }));

        expect(await screen.findByText('Confirmada: Academia Smart')).toBeInTheDocument();
        expect(bodies).toEqual([{ fromTransactionId: 'tx-out' }]);
    });

    it('mostra o erro quando a API recusa', async () => {
        seed();
        server.use(http.post('*/spending/recurring', () => HttpResponse.json(problem('identity.forbidden', 403), { status: 403 })));
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await screen.findByText('ACADEMIA SMART');

        await user.click(screen.getByRole('button', { name: 'Marcar como recorrente' }));

        expect(await screen.findByText('Só quem edita a conta pode mudar assinaturas e contas.')).toBeInTheDocument();
    });

    it('leitor não vê a ação, mas vê o selo', async () => {
        seed();
        renderRouterAt(PATH, { signedIn: true });
        asRole('viewer');
        await screen.findByText('NETFLIX.COM');

        await waitFor((): void => {
            expect(screen.queryByRole('button', { name: 'Marcar como recorrente' })).not.toBeInTheDocument();
        });
        expect(screen.getByText('Recorrente')).toBeInTheDocument();
    });
});
