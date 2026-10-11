import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { renderRouterAt } from '../../../../../test/router';

async function openedAt(path: string): Promise<AnyRouter> {
    const router: AnyRouter = renderRouterAt(path, { signedIn: true });
    await screen.findByRole('heading', { name: 'Gastos', level: 1 });
    return router;
}

describe('ImportStatementHost', () => {
    it('não mostra o modal sem o parâmetro', async () => {
        await openedAt('/spending/transactions');

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it.each(['/spending', '/spending/transactions', '/spending/connections'])('?import=true abre o modal em %s', async (path: string) => {
        await openedAt(`${path}?import=true`);

        expect(await screen.findByRole('dialog', { name: 'Importar extrato' })).toBeInTheDocument();
    });

    it('fechar remove o parâmetro e mantém os outros filtros', async () => {
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = await openedAt('/spending/transactions?month=2026-09&import=true');

        await user.click(await screen.findByRole('button', { name: 'Cancelar' }));

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
        expect(router.state.location.search).toEqual({ month: '2026-09' });
    });

    it('Esc também fecha', async () => {
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = await openedAt('/spending/connections?import=true');
        await screen.findByRole('dialog');

        await user.keyboard('{Escape}');

        await waitFor(() => {
            expect(router.state.location.search).toEqual({});
        });
    });

    it('o botão do cartão abre o modal e o foco volta a ele ao fechar', async () => {
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = await openedAt('/spending/connections');
        const button: HTMLElement = await screen.findByRole('button', { name: 'Importar arquivo' });

        await user.click(button);
        expect(await screen.findByRole('dialog', { name: 'Importar extrato' })).toBeInTheDocument();
        expect(router.state.location.search).toEqual({ import: true });
        await user.click(screen.getByRole('button', { name: 'Cancelar' }));

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
        expect(button).toHaveFocus();
    });
});
