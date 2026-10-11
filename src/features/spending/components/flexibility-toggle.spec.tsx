import { describe, expect, it, vi, type MockInstance } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import * as analytics from '@/shared/lib/analytics';
import { server } from '../../../../test/msw/server';
import { renderWithProviders } from '../../../../test/render';
import { categoryView, systemCategory } from '../../../../test/fixtures/spending';
import { FlexibilityToggle } from './flexibility-toggle';

vi.mock('@/shared/lib/analytics', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/shared/lib/analytics')>()),
    track: vi.fn()
}));

describe('FlexibilityToggle', () => {
    it('mostra a natureza em texto e o estado em aria-pressed', () => {
        renderWithProviders(<FlexibilityToggle category={systemCategory('leisure')} />);

        const toggle: HTMLElement = screen.getByRole('button', { name: 'Natureza de Lazer: flexível' });
        expect(toggle).toHaveTextContent('flexível');
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('categoria fixa não está pressionada', () => {
        renderWithProviders(<FlexibilityToggle category={systemCategory('housing')} />);

        expect(screen.getByRole('button', { name: 'Natureza de Moradia: fixo' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('alterna chamando o PATCH, avisa o analytics e invalida o resumo e os cortes', async () => {
        const user: UserEvent = userEvent.setup();
        const bodies: unknown[] = [];
        server.use(
            http.patch('*/spending/categories/:id', async ({ request, params }) => {
                bodies.push({ id: params['id'], body: await request.json() });
                return HttpResponse.json({ ...systemCategory('leisure'), flexibility: 'fixed' });
            })
        );
        renderWithProviders(<FlexibilityToggle category={systemCategory('leisure')} />);

        await user.click(screen.getByRole('button', { name: 'Natureza de Lazer: flexível' }));

        await waitFor(() => {
            expect(bodies).toEqual([{ id: 'cat-leisure', body: { flexibility: 'fixed' } }]);
        });
        const track: MockInstance = vi.mocked(analytics.track);
        await waitFor(() => {
            expect(track).toHaveBeenCalledWith('spending_flexibility_changed', { flexibility: 'fixed' });
        });
    });

    it('fica desabilitado enquanto grava', async () => {
        const user: UserEvent = userEvent.setup();
        let release: () => void = (): void => undefined;
        const gate: Promise<void> = new Promise<void>((resolve): void => {
            release = resolve;
        });
        server.use(
            http.patch('*/spending/categories/:id', async () => {
                await gate;
                return HttpResponse.json({ ...systemCategory('housing'), flexibility: 'flexible' });
            })
        );
        renderWithProviders(<FlexibilityToggle category={systemCategory('housing')} />);

        await user.click(screen.getByRole('button', { name: 'Natureza de Moradia: fixo' }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Natureza de Moradia: fixo' })).toBeDisabled();
        });
        release();
        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Natureza de Moradia: fixo' })).toBeEnabled();
        });
    });

    it('mostra o aviso crítico quando a gravação falha', async () => {
        const user: UserEvent = userEvent.setup();
        server.use(
            http.patch('*/spending/categories/:id', () =>
                HttpResponse.json(
                    { type: 'categories.category_not_found', title: 'x', status: 404, detail: 'nope', requestId: null },
                    { status: 404 }
                )
            )
        );
        renderWithProviders(<FlexibilityToggle category={systemCategory('leisure')} />);

        await user.click(screen.getByRole('button', { name: 'Natureza de Lazer: flexível' }));

        expect(await screen.findByText('Não deu para mudar a categoria. Tente de novo.')).toBeInTheDocument();
        expect(screen.getByText('Essa categoria não existe mais.')).toBeInTheDocument();
    });

    it('não aparece para renda nem para transferência', () => {
        const { container } = renderWithProviders(<FlexibilityToggle category={categoryView({ kind: 'income', flexibility: null })} />);

        expect(container).toBeEmptyDOMElement();
    });
});
