import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { problem } from '../../../../../test/fixtures/auth';
import { recurringOverview, SERIES_ID_LIGHT } from '../../../../../test/fixtures/recurring';
import { server } from '../../../../../test/msw/server';
import { renderRouterAt } from '../../../../../test/router';

async function openDetail(name: string): Promise<{ user: UserEvent; detail: HTMLElement }> {
    server.use(http.get('*/spending/recurring', () => HttpResponse.json(recurringOverview())));
    renderRouterAt('/spending/recurring', { signedIn: true });
    const user: UserEvent = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: `Detalhes de ${name}` }));
    return { user, detail: await screen.findByRole('dialog', { name }) };
}

describe('Detalhe da série: aviso na véspera', () => {
    it('mostra o estado da pessoa e liga o aviso da série confirmada', async () => {
        let sent: { id: string; enabled: boolean } | null = null;
        server.use(
            http.get('*/spending/recurring/notice-before', () => HttpResponse.json({ seriesIds: [] })),
            http.put('*/spending/recurring/:id/notice-before', async ({ params, request }) => {
                sent = { id: String(params['id']), enabled: ((await request.json()) as { enabled: boolean }).enabled };
                return HttpResponse.json({ seriesId: SERIES_ID_LIGHT, enabled: true });
            })
        );
        const { user, detail } = await openDetail('Enel');

        const toggle: HTMLElement = await within(detail).findByRole('switch', { name: 'Avisar por e-mail na véspera' });
        expect(toggle).not.toBeChecked();
        await user.click(toggle);

        await waitFor((): void => {
            expect(sent).toEqual({ id: SERIES_ID_LIGHT, enabled: true });
        });
        expect(await screen.findByText('Você vai receber o aviso na véspera.')).toBeInTheDocument();
    });

    it('vem ligado quando a pessoa já escolheu e desliga com aviso', async () => {
        server.use(http.get('*/spending/recurring/notice-before', () => HttpResponse.json({ seriesIds: [SERIES_ID_LIGHT] })));
        const { user, detail } = await openDetail('Enel');

        const toggle: HTMLElement = await within(detail).findByRole('switch', { name: 'Avisar por e-mail na véspera' });
        expect(toggle).toBeChecked();
        await user.click(toggle);

        expect(await screen.findByText('Você não vai mais receber o aviso na véspera.')).toBeInTheDocument();
    });

    it('mostra o erro quando a API recusa', async () => {
        server.use(
            http.put('*/spending/recurring/:id/notice-before', () =>
                HttpResponse.json(problem('recurring.invalid_state', 409), { status: 409 })
            )
        );
        const { user, detail } = await openDetail('Enel');

        await user.click(await within(detail).findByRole('switch', { name: 'Avisar por e-mail na véspera' }));

        expect(await screen.findByText(/já mudou de situação/)).toBeInTheDocument();
    });
});
