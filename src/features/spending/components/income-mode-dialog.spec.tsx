import { describe, expect, it, vi, type Mock } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/msw/server';
import { renderWithProviders } from '../../../../test/render';
import { spendingSettings } from '../../../../test/fixtures/spending';
import { IncomeModeDialog } from './income-mode-dialog';

async function openDialog(onOpenChange: Mock = vi.fn()): Promise<{ user: UserEvent; onOpenChange: Mock }> {
    const user: UserEvent = userEvent.setup();
    renderWithProviders(<IncomeModeDialog open onOpenChange={onOpenChange} />);
    await screen.findByRole('radiogroup', { name: 'Origem da renda' });
    return { user, onOpenChange };
}

describe('IncomeModeDialog', () => {
    it('não renderiza nada fechado', () => {
        const { container } = renderWithProviders(<IncomeModeDialog open={false} onOpenChange={vi.fn()} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('abre no modo das transações, sem campo de valor', async () => {
        await openDialog();

        expect(screen.getByRole('radio', { name: 'Das transações' })).toBeChecked();
        expect(screen.queryByLabelText('Renda por mês')).not.toBeInTheDocument();
    });

    it('valor fixo exige um valor maior que zero', async () => {
        const { user } = await openDialog();

        await user.click(screen.getByRole('radio', { name: 'Valor fixo por mês' }));
        await user.click(screen.getByRole('button', { name: 'Salvar' }));

        expect(await screen.findByText('Informe um valor maior que zero')).toBeInTheDocument();
    });

    it('grava o valor fixo e fecha', async () => {
        const bodies: unknown[] = [];
        server.use(
            http.put('*/spending/settings', async ({ request }) => {
                const body: object = (await request.json()) as object;
                bodies.push(body);
                return HttpResponse.json(spendingSettings({ incomeMode: 'declared', declaredIncomeMinor: 500000 }));
            })
        );
        const { user, onOpenChange } = await openDialog();

        await user.click(screen.getByRole('radio', { name: 'Valor fixo por mês' }));
        await user.type(screen.getByLabelText('Renda por mês'), '5000');
        await user.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => {
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });
        expect(bodies).toEqual([{ incomeMode: 'declared', declaredIncomeMinor: 500000 }]);
        expect(await screen.findByText('Origem da renda atualizada')).toBeInTheDocument();
    });

    it('voltar para as transações grava só o modo', async () => {
        const bodies: unknown[] = [];
        server.use(
            http.get('*/spending/settings', () =>
                HttpResponse.json(spendingSettings({ incomeMode: 'declared', declaredIncomeMinor: 500000 }))
            ),
            http.put('*/spending/settings', async ({ request }) => {
                bodies.push(await request.json());
                return HttpResponse.json(spendingSettings());
            })
        );
        const { user, onOpenChange } = await openDialog();

        await user.click(screen.getByRole('radio', { name: 'Das transações' }));
        await user.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => {
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });
        expect(bodies).toEqual([{ incomeMode: 'transactions' }]);
    });

    it('mostra o erro summary.declared_income_required no campo', async () => {
        server.use(
            http.put('*/spending/settings', () =>
                HttpResponse.json(
                    { type: 'summary.declared_income_required', title: 'x', status: 422, detail: 'required', requestId: null },
                    { status: 422 }
                )
            )
        );
        const { user, onOpenChange } = await openDialog();

        await user.click(screen.getByRole('radio', { name: 'Valor fixo por mês' }));
        await user.type(screen.getByLabelText('Renda por mês'), '10');
        await user.click(screen.getByRole('button', { name: 'Salvar' }));

        expect(await screen.findByText('Informe a renda por mês para usar o valor fixo.')).toBeInTheDocument();
        expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('mostra o erro de rede como aviso crítico', async () => {
        server.use(http.put('*/spending/settings', () => HttpResponse.error()));
        const { user } = await openDialog();

        await user.click(screen.getByRole('button', { name: 'Salvar' }));

        expect(await screen.findByText('Não foi possível concluir. Tente de novo em instantes.')).toBeInTheDocument();
    });

    it('cancelar fecha sem gravar', async () => {
        const { user, onOpenChange } = await openDialog();

        await user.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('mostra o erro de carga das configurações', async () => {
        server.use(
            http.get('*/spending/settings', () =>
                HttpResponse.json({ type: 'validation_failed', title: 'x', status: 500, detail: 'boom', requestId: 'r-1' }, { status: 500 })
            )
        );
        renderWithProviders(<IncomeModeDialog open onOpenChange={vi.fn()} />);

        expect(
            await screen.findByText('Não foi possível concluir. Tente de novo em instantes.', {}, { timeout: 5000 })
        ).toBeInTheDocument();
    });
});
