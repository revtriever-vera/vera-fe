import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { sessionIdentity } from '../../../test/fixtures/auth';
import { installCutsApi } from '../../../test/helpers/cuts-api';
import { installContributionApi } from '../../../test/helpers/contribution-api';
import { mockHoldingsApi } from '../../../test/helpers/holdings-api';
import { installTargetsApi } from '../../../test/helpers/targets-api';
import { mockTransactionsApi } from '../../../test/helpers/transactions-api';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

type Role = 'owner' | 'editor' | 'viewer';

function openAs(role: Role, path: string): void {
    server.use(
        http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ role }))),
        ...signedInHandlers()
    );
    renderRouterAt(path);
}

describe('viewer sees no editing in the portfolio', () => {
    it('hides add, quantity, class, remove and base currency in Meus ativos', async () => {
        mockHoldingsApi();
        openAs('viewer', '/portfolio/assets');
        await screen.findByRole('table', { name: 'Seus ativos' });

        expect(screen.queryByRole('button', { name: 'Adicionar ativo' })).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Quantidade de ITUB4')).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox', { name: 'Classe de ITUB4' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^Remover/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('radiogroup', { name: 'Moeda base' })).not.toBeInTheDocument();
    });

    it('keeps the editor with every control', async () => {
        mockHoldingsApi();
        openAs('editor', '/portfolio/assets');

        expect(await screen.findByLabelText('Quantidade de ITUB4')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Adicionar ativo' })).toBeInTheDocument();
    });

    it('shows the targets as text, with no steppers, save or manage classes', async () => {
        installTargetsApi();
        openAs('viewer', '/portfolio/targets');
        await screen.findByRole('list', { name: 'Metas por classe' });

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Salvar metas' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Gerenciar classes/ })).not.toBeInTheDocument();
    });

    it('still calculates where to contribute', async () => {
        const user: UserEvent = userEvent.setup();
        installContributionApi();
        openAs('viewer', '/portfolio/contribution?amount=10000');

        const list: HTMLElement = await screen.findByRole('list', { name: 'Sugestão por classe' });
        expect(within(list).getAllByRole('listitem').length).toBeGreaterThan(0);
        expect(user).toBeDefined();
    });
});

describe('viewer sees no editing in spending', () => {
    it('hides recategorize and import in Transações', async () => {
        mockTransactionsApi();
        openAs('viewer', '/spending/transactions?month=2026-09');
        await screen.findByText('IFOOD *RESTAURANTE SABOR');

        expect(screen.queryByRole('button', { name: /trocar a categoria/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Importar extrato' })).not.toBeInTheDocument();
    });

    it('lets the viewer simulate the goal but not save it', async () => {
        installCutsApi();
        openAs('viewer', '/spending/cuts?month=2026-09');
        const slider: HTMLElement = await screen.findByRole('slider', { name: 'Meta de economia' });

        expect(slider).toBeInTheDocument();
        await waitFor((): void => {
            expect(screen.queryByRole('button', { name: 'Salvar meta' })).not.toBeInTheDocument();
        });
    });

    it('hides the new rule and new category buttons in Regras', async () => {
        openAs('viewer', '/spending/rules');
        await screen.findByRole('heading', { name: 'Categorias' });

        expect(screen.queryByRole('button', { name: 'Nova regra' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Nova categoria' })).not.toBeInTheDocument();
    });
});

describe('owner keeps every control', () => {
    it('shows save targets, new rule, new category and import', async () => {
        installTargetsApi();
        openAs('owner', '/portfolio/targets');
        expect(await screen.findByRole('button', { name: 'Salvar metas' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Gerenciar/ })).toBeInTheDocument();
    });

    it('shows recategorize and import in Transações', async () => {
        mockTransactionsApi();
        openAs('owner', '/spending/transactions?month=2026-09');
        await screen.findByText('IFOOD *RESTAURANTE SABOR');
        expect(screen.getAllByRole('button', { name: /trocar a categoria/ }).length).toBeGreaterThan(0);
        expect(screen.getByRole('link', { name: 'Importar extrato' })).toBeInTheDocument();
    });

    it('shows the new rule and new category buttons in Regras', async () => {
        openAs('owner', '/spending/rules');
        expect(await screen.findByRole('button', { name: 'Nova regra' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Nova categoria' })).toBeInTheDocument();
    });
});

describe('settings by role', () => {
    it('hides Exportar tudo from an editor in Dados e privacidade', async () => {
        openAs('editor', '/settings/privacy');
        await screen.findByText('Só o Dono da conta exporta ou exclui os dados.');

        expect(screen.queryByRole('button', { name: /Exportar/ })).not.toBeInTheDocument();
    });
});
