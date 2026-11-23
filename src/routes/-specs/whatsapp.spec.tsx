import { describe, expect, it, vi, type MockInstance } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { BillingMe } from '@/features/billing/types';
import type { IssuedCode, LinkView } from '@/features/whatsapp/types';
import * as analytics from '@/shared/lib/analytics';
import { problem } from '../../../test/fixtures/auth';
import { billingMe, billingUsage, freeBilling, selfHostedBilling } from '../../../test/fixtures/billing';
import { activeLink, issuedCode, linkView, pendingLink, reminderItem, remindersView, WA_LINK } from '../../../test/fixtures/whatsapp';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

interface Mock {
    link: LinkView;
    posted: unknown[];
    deleted: string[];
    unlinked: number;
    linkCalls: number;
}

function mockWhatsApp(link: LinkView, billing: BillingMe = billingMe()): Mock {
    const mock: Mock = { link, posted: [], deleted: [], unlinked: 0, linkCalls: 0 };
    server.use(
        http.get('*/billing/me', (): Response => HttpResponse.json(billing)),
        http.get('*/whatsapp/link', (): Response => {
            mock.linkCalls += 1;
            return HttpResponse.json(mock.link);
        }),
        http.post('*/whatsapp/link/code', async ({ request }): Promise<Response> => {
            mock.posted.push(await request.json());
            const issued: IssuedCode = issuedCode();
            mock.link = pendingLink(issued.expiresAt);
            return HttpResponse.json(issued);
        }),
        http.delete('*/whatsapp/link', (): Response => {
            mock.unlinked += 1;
            mock.link = linkView();
            return new HttpResponse(null, { status: 204 });
        }),
        http.delete('*/reminders/:id', ({ params }): Response => {
            mock.deleted.push(String(params['id']));
            return new HttpResponse(null, { status: 204 });
        })
    );
    return mock;
}

async function openTab(): Promise<void> {
    renderRouterAt('/settings/whatsapp', { signedIn: true });
    await screen.findByRole('heading', { name: 'Configurações', level: 1 });
}

describe('aba WhatsApp: estados', () => {
    it('no Free mostra o cartão bloqueado com a ação para o plano', async () => {
        mockWhatsApp(linkView(), freeBilling());
        await openTab();

        expect(await screen.findByText('Disponível no Premium.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver o Premium' })).toHaveAttribute('href', '/settings/plan');
        expect(screen.queryByRole('button', { name: 'Gerar código' })).not.toBeInTheDocument();
    });

    it('na auto-hospedada sem chave mostra o aviso e leva às integrações', async () => {
        mockWhatsApp(linkView(), selfHostedBilling({ features: { ai: 'disabled', whatsapp: 'disabled', calendar: 'disabled' } }));
        await openTab();

        expect(await screen.findByText('Sem as chaves do WhatsApp e do modelo de linguagem nesta instalação.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver integrações' })).toHaveAttribute('href', '/settings/integrations');
    });

    it('na hospedada com o número fora do ar avisa sem ação', async () => {
        mockWhatsApp(linkView(), billingMe({ features: { ai: 'available', whatsapp: 'disabled', calendar: 'available' } }));
        await openTab();

        expect(await screen.findByText('A Vera no WhatsApp está indisponível agora.')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Ver integrações' })).not.toBeInTheDocument();
    });

    it('com a cota pausada mostra o vínculo e a faixa da cota', async () => {
        mockWhatsApp(
            activeLink(),
            billingMe({
                features: { ai: 'paused', whatsapp: 'paused', calendar: 'available' },
                usage: billingUsage({ state: 'paused', usedBps: 10000, resetsAt: '2026-12-01T03:00:00.000Z' })
            })
        );
        await openTab();

        expect(await screen.findByText('Cota do mês esgotada. A Vera volta a responder em 1º de dezembro.')).toBeInTheDocument();
        expect(screen.getByText('Número vinculado')).toBeInTheDocument();
        expect(screen.getByText('Com a cota esgotada, os lembretes não saem até o mês virar.')).toBeInTheDocument();
    });

    it.each([
        ['stale', 'Vínculo desfeito por falta de uso. Vincule de novo quando quiser.'],
        ['premium_ended', 'O Premium terminou e o número foi desconectado.']
    ] as const)('avisa quando o vínculo foi desfeito por %s', async (lastUnlinkReason, message) => {
        mockWhatsApp(linkView({ lastUnlinkReason }));
        await openTab();

        expect(await screen.findByText(message)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Gerar código' })).toBeInTheDocument();
    });

    it('não avisa quando o vínculo acabou por outros motivos', async () => {
        mockWhatsApp(linkView({ lastUnlinkReason: 'user_app' }));
        await openTab();

        await screen.findByRole('button', { name: 'Gerar código' });
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});

describe('aba WhatsApp: vincular', () => {
    it('sem consentimento exigido gera o código sem a caixa', async () => {
        const user: UserEvent = userEvent.setup();
        const mock: Mock = mockWhatsApp(linkView());
        await openTab();

        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        await user.click(await screen.findByRole('button', { name: 'Gerar código' }));

        await screen.findByText('Falta só a mensagem');
        expect(mock.posted).toEqual([{}]);
    });

    it('com consentimento exigido o botão espera a caixa e envia consent', async () => {
        const user: UserEvent = userEvent.setup();
        const mock: Mock = mockWhatsApp(linkView({ consentRequired: true }));
        await openTab();

        const generate: HTMLElement = await screen.findByRole('button', { name: 'Gerar código' });
        expect(generate).toBeDisabled();
        expect(screen.getByRole('link', { name: 'Ver o que é enviado' })).toHaveAttribute('href', '/settings/privacy');
        await user.click(screen.getByRole('checkbox'));
        await user.click(generate);

        await screen.findByText('Falta só a mensagem');
        expect(mock.posted).toEqual([{ consent: true }]);
    });

    it('mostra o botão com o waLink, o QR do mesmo link e o código copiável', async () => {
        const user: UserEvent = userEvent.setup();
        const track: MockInstance<typeof analytics.track> = vi.spyOn(analytics, 'track');
        mockWhatsApp(linkView());
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Gerar código' }));

        const open: HTMLElement = await screen.findByRole('link', { name: 'Abrir no WhatsApp' });
        expect(open).toHaveAttribute('href', WA_LINK);
        expect(screen.getByTitle('QR code para vincular o WhatsApp')).toBeInTheDocument();
        expect(screen.getByText('Ou mande VINCULAR K7M2QX9D para +55 11 4000-0000.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Copiar o código' })).toBeInTheDocument();
        expect(screen.getByText(/O código vale até/)).toBeInTheDocument();
        await user.click(open);
        expect(track).toHaveBeenCalledWith('whatsapp_link_code_issued');
        expect(track).toHaveBeenCalledWith('whatsapp_link_opened', { via: 'button' });
        expect(track).toHaveBeenCalledWith('whatsapp_link_opened', { via: 'qr' });
        track.mockRestore();
    });

    it('ao recarregar com código pendente não mostra o código e oferece gerar outro', async () => {
        const user: UserEvent = userEvent.setup();
        const mock: Mock = mockWhatsApp(pendingLink('2099-11-22T12:10:00.000Z'));
        await openTab();

        expect(await screen.findByText(/Você já gerou um código/)).toBeInTheDocument();
        expect(screen.queryByText(/VINCULAR/)).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Abrir no WhatsApp' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Gerar outro código' }));
        await waitFor(() => {
            expect(mock.posted).toEqual([{}]);
        });
        expect(await screen.findByRole('link', { name: 'Abrir no WhatsApp' })).toBeInTheDocument();
    });

    it('código vencido mostra o aviso e Gerar outro código', async () => {
        const user: UserEvent = userEvent.setup();
        const mock: Mock = mockWhatsApp(linkView());
        server.use(
            http.post('*/whatsapp/link/code', (): Response =>
                HttpResponse.json(issuedCode({ expiresAt: new Date(Date.now() + 1200).toISOString() }))
            )
        );
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Gerar código' }));

        expect(await screen.findByText('O código venceu.', undefined, { timeout: 4000 })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Gerar outro código' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Abrir no WhatsApp' })).not.toBeInTheDocument();
        expect(mock.link.status).toBe('none');
    });

    it('o polling percebe o vínculo, avisa e passa para o estado vinculado', async () => {
        const user: UserEvent = userEvent.setup();
        const track: MockInstance<typeof analytics.track> = vi.spyOn(analytics, 'track');
        const mock: Mock = mockWhatsApp(linkView());
        await openTab();
        await user.click(await screen.findByRole('button', { name: 'Gerar código' }));
        await screen.findByText('Falta só a mensagem');
        mock.link = activeLink();

        expect(await screen.findByText('Número vinculado', undefined, { timeout: 8000 })).toBeInTheDocument();
        expect(screen.getByText('WhatsApp vinculado')).toBeInTheDocument();
        expect(screen.getByText('+55 11 99999-0001')).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('whatsapp_linked', { consentGiven: false });
        track.mockRestore();
    }, 15_000);

    it('mostra a mensagem certa quando pedem muitos códigos', async () => {
        const user: UserEvent = userEvent.setup();
        mockWhatsApp(linkView());
        server.use(
            http.post('*/whatsapp/link/code', (): Response => HttpResponse.json(problem('core.too_many_attempts', 429), { status: 429 }))
        );
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Gerar código' }));

        expect(await screen.findByText('Muitos códigos seguidos. Tente de novo em uma hora.')).toBeInTheDocument();
    });

    it('traduz o erro de Premium exigido pelo código da cobrança', async () => {
        const user: UserEvent = userEvent.setup();
        mockWhatsApp(linkView());
        server.use(
            http.post('*/whatsapp/link/code', (): Response => HttpResponse.json(problem('billing.premium_required', 402), { status: 402 }))
        );
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Gerar código' }));

        expect(await screen.findByText('Esta função é do plano Premium.')).toBeInTheDocument();
    });
});

describe('aba WhatsApp: vinculado', () => {
    it('mostra o número, os exemplos no lugar do simulador e o medidor só na hospedada', async () => {
        mockWhatsApp(activeLink(), billingMe({ usage: billingUsage() }));
        await openTab();

        expect(await screen.findByText('Número vinculado')).toBeInTheDocument();
        expect(screen.getByText('+55 11 99999-0001')).toBeInTheDocument();
        expect(screen.getByText('ativo')).toBeInTheDocument();
        expect(screen.getByText('A Vera responde por +55 11 4000-0000.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Abrir no WhatsApp' })).toHaveAttribute('href', 'https://wa.me/551140000000');
        expect(screen.getByText('Quanto gastei com delivery?')).toBeInTheDocument();
        expect(screen.getByText('A Vera não faz Pix nem pagamentos.')).toBeInTheDocument();
        expect(screen.getByRole('meter', { hidden: true })).toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('na auto-hospedada não mostra o medidor', async () => {
        mockWhatsApp(activeLink(), selfHostedBilling({ features: { ai: 'available', whatsapp: 'available', calendar: 'available' } }));
        await openTab();

        await screen.findByText('Número vinculado');
        expect(screen.queryByRole('meter', { hidden: true })).not.toBeInTheDocument();
    });

    it('lista os lembretes e apaga um', async () => {
        const user: UserEvent = userEvent.setup();
        const mock: Mock = mockWhatsApp(activeLink());
        server.use(http.get('*/reminders', (): Response => HttpResponse.json(remindersView([reminderItem()]))));
        await openTab();

        expect(await screen.findByText('todo dia 5, 09:00')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Apagar lembrete Aportar' }));

        expect(await screen.findByText('Lembrete apagado')).toBeInTheDocument();
        expect(mock.deleted).toEqual(['rem-1']);
    });

    it('sem lembretes mostra o vazio com o convite', async () => {
        mockWhatsApp(activeLink());
        await openTab();

        expect(await screen.findByText(/Nenhum lembrete\. Peça no WhatsApp/)).toBeInTheDocument();
    });

    it('desvincula só depois da confirmação', async () => {
        const user: UserEvent = userEvent.setup();
        const mock: Mock = mockWhatsApp(activeLink());
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Desvincular' }));
        const dialog: HTMLElement = await screen.findByRole('dialog');
        expect(within(dialog).getByText(/A Vera para de responder em \+55 11 99999-0001/)).toBeInTheDocument();
        expect(mock.unlinked).toBe(0);
        await user.click(within(dialog).getByRole('button', { name: 'Desvincular' }));

        expect(await screen.findByText('WhatsApp desvinculado')).toBeInTheDocument();
        expect(await screen.findByText('Vincular seu WhatsApp')).toBeInTheDocument();
        expect(mock.unlinked).toBe(1);
    });
});
