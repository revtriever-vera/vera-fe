import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { track } from '@/shared/lib/analytics';
import { mockTransactionsApi, type TransactionsApi } from '../../../../../test/helpers/transactions-api';
import { renderRouterAt } from '../../../../../test/router';

const PATH: string = '/spending/transactions?month=2026-09';
const PIX_TITLE: string = 'Pix enviado · Maria Souza';

async function loaded(): Promise<void> {
    await screen.findByText('IFOOD *RESTAURANTE SABOR');
}

function pixRow(amount: string): HTMLElement {
    const row: HTMLElement | undefined = screen
        .getAllByRole('row')
        .find(
            (candidate: HTMLElement): boolean =>
                (candidate.textContent ?? '').includes(amount) && (candidate.textContent ?? '').includes(PIX_TITLE)
        );
    if (row === undefined) {
        throw new Error(`linha do Pix de ${amount} não encontrada`);
    }
    return row;
}

async function pickCategory(user: UserEvent, row: HTMLElement, name: RegExp): Promise<void> {
    await user.click(within(row).getByRole('button', { name: `Categoria de ${PIX_TITLE}` }));
    await user.click(await screen.findByRole('option', { name }));
}

describe('correção na própria linha', () => {
    it('Pix de 450 com "sempre para": cria a regra, avisa e zera o aviso do topo', async () => {
        const api: TransactionsApi = mockTransactionsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();
        expect(await screen.findByRole('alert')).toHaveTextContent('2 transações sem categoria');
        const row: HTMLElement = pixRow('450,00');

        await pickCategory(user, row, /Casa e serviços/);
        expect(within(row).getByRole('checkbox', { name: 'sempre para Maria Souza' })).toBeChecked();
        await user.click(within(row).getByRole('button', { name: 'Aplicar' }));

        expect(await screen.findByText('Regra criada para Maria Souza: mais 1 transação recategorizada.')).toBeInTheDocument();
        expect(screen.getByText('Categoria aplicada')).toBeInTheDocument();
        expect(api.patches).toEqual([{ id: 'tx-024', body: { categoryId: 'cat-home-services', rule: { scope: 'counterparty' } } }]);
        expect(await screen.findByText('Tudo categorizado')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Aplicar' })).toBeNull();
        expect(track).toHaveBeenCalledWith('spending_transaction_recategorized', { withRule: true, scope: 'counterparty' });
    });

    it('sem marcar "sempre", o PATCH vai com rule null e o toast não fala de regra', async () => {
        const api: TransactionsApi = mockTransactionsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();
        const row: HTMLElement = pixRow('450,00');

        await pickCategory(user, row, /Casa e serviços/);
        await user.click(within(row).getByRole('checkbox', { name: 'sempre para Maria Souza' }));
        await user.click(within(row).getByRole('button', { name: 'Aplicar' }));

        expect(await screen.findByText('Categoria aplicada')).toBeInTheDocument();
        expect(screen.queryByText(/Regra criada/)).toBeNull();
        expect(api.patches[0]?.body).toEqual({ categoryId: 'cat-home-services', rule: null });
        expect(track).toHaveBeenCalledWith('spending_transaction_recategorized', { withRule: false, scope: null });
        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('1 transação sem categoria');
        });
    });

    it('o botão Aplicar só vale depois de escolher a categoria', async () => {
        mockTransactionsApi();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        expect(within(pixRow('450,00')).getByRole('button', { name: 'Aplicar' })).toBeDisabled();
    });

    it('o 422 de categoria de outra natureza aparece junto ao seletor', async () => {
        mockTransactionsApi({ patchFailures: [{ type: 'transactions.category_kind_mismatch', status: 422 }] });
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();
        const row: HTMLElement = pixRow('450,00');

        await pickCategory(user, row, /Casa e serviços/);
        await user.click(within(row).getByRole('button', { name: 'Aplicar' }));

        expect(await within(row).findByRole('alert')).toHaveTextContent('Categoria de renda não vale para uma saída');
    });

    it('o 422 de regra inválida troca o escopo para a descrição e deixa reenviar', async () => {
        const api: TransactionsApi = mockTransactionsApi({ patchFailures: [{ type: 'categories.invalid_rule', status: 422 }] });
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();
        const row: HTMLElement = pixRow('450,00');

        await pickCategory(user, row, /Casa e serviços/);
        await user.click(within(row).getByRole('button', { name: 'Aplicar' }));
        expect(await within(row).findByRole('alert')).toHaveTextContent(
            'Esta transação não tem favorecido identificado; a regra vai usar a descrição'
        );
        await user.click(within(row).getByRole('button', { name: 'Aplicar' }));

        expect(await screen.findByText(/Regra criada para Maria Souza/)).toBeInTheDocument();
        expect(api.patches.map((patch) => patch.body.rule)).toEqual([{ scope: 'counterparty' }, { scope: 'description' }]);
    });

    it('um erro genérico vira toast e mantém a linha', async () => {
        mockTransactionsApi({ patchFailures: [{ type: 'categories.category_not_found', status: 404 }] });
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();
        const row: HTMLElement = pixRow('450,00');

        await pickCategory(user, row, /Casa e serviços/);
        await user.click(within(row).getByRole('button', { name: 'Aplicar' }));

        expect(await screen.findByText('Essa categoria não existe mais.')).toBeInTheDocument();
        expect(within(row).getByRole('button', { name: 'Aplicar' })).toBeInTheDocument();
    });

    it('funciona só por teclado e o toast é anunciado', async () => {
        const api: TransactionsApi = mockTransactionsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();
        const row: HTMLElement = pixRow('450,00');

        within(row)
            .getByRole('button', { name: `Categoria de ${PIX_TITLE}` })
            .focus();
        await user.keyboard('{Enter}');
        await user.keyboard('casa');
        await user.keyboard('{ArrowDown}{Enter}');
        await user.tab();
        expect(within(row).getByRole('checkbox')).toHaveFocus();
        await user.keyboard(' ');
        await user.tab();
        expect(within(row).getByRole('button', { name: 'Aplicar' })).toHaveFocus();
        await user.keyboard('{Enter}');

        await waitFor(() => {
            expect(api.patches).toHaveLength(1);
        });
        expect(api.patches[0]?.body).toEqual({ categoryId: 'cat-home-services', rule: null });
        expect(await screen.findByRole('status')).toHaveTextContent('Categoria aplicada');
    });
});

describe('troca numa linha categorizada', () => {
    it('abre o modal com "sempre" desmarcado e envia a nova categoria', async () => {
        const api: TransactionsApi = mockTransactionsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        await user.click(screen.getByRole('button', { name: 'Mercado: trocar a categoria de SUPERMERCADO BOM PRECO' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Trocar categoria' });
        expect(within(dialog).getByRole('checkbox', { name: 'sempre para SUPERMERCADO BOM PRECO' })).not.toBeChecked();
        expect(within(dialog).queryByRole('button', { name: 'Voltar ao automático' })).toBeNull();
        expect(within(dialog).getByRole('button', { name: 'Salvar' })).toBeDisabled();
        await user.click(within(dialog).getByRole('button', { name: /Nova categoria/ }));
        await user.click(await screen.findByRole('option', { name: /Lazer/ }));
        await user.click(within(dialog).getByRole('checkbox'));
        await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

        expect(await screen.findByText(/Regra criada para SUPERMERCADO BOM PRECO/)).toBeInTheDocument();
        expect(api.patches[0]?.body).toEqual({ categoryId: 'cat-leisure', rule: { scope: 'description' } });
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).toBeNull();
        });
    });

    it('"Voltar ao automático" só existe numa linha corrigida por você e manda categoryId null', async () => {
        const api: TransactionsApi = mockTransactionsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();
        const row: HTMLElement = pixRow('450,00');
        await pickCategory(user, row, /Casa e serviços/);
        await user.click(within(row).getByRole('button', { name: 'Aplicar' }));
        const [first] = await screen.findAllByRole('button', { name: `Casa e serviços: trocar a categoria de ${PIX_TITLE}` });

        await user.click(first as HTMLElement);
        const dialog: HTMLElement = await screen.findByRole('dialog');
        await user.click(within(dialog).getByRole('button', { name: 'Voltar ao automático' }));

        expect(await screen.findByText('A categoria voltou ao automático')).toBeInTheDocument();
        expect(api.patches[1]?.body).toEqual({ categoryId: null, rule: null });
    });

    it('o modal prende o foco e fecha com Esc', async () => {
        mockTransactionsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        await user.click(screen.getByRole('button', { name: 'Mercado: trocar a categoria de SUPERMERCADO BOM PRECO' }));
        const dialog: HTMLElement = await screen.findByRole('dialog');
        for (let step: number = 0; step < 8; step += 1) {
            await user.tab();
            expect(dialog.contains(document.activeElement)).toBe(true);
        }
        await user.keyboard('{Escape}');

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).toBeNull();
        });
        expect(screen.getByRole('button', { name: 'Mercado: trocar a categoria de SUPERMERCADO BOM PRECO' })).toHaveFocus();
    });
});
