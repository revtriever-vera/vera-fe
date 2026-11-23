import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { track } from '@/shared/lib/analytics';
import type { ConsentState } from '../types';
import { consentState, grantedConsent, payloadBody } from '../../../../test/fixtures/summaries';
import { problem } from '../../../../test/fixtures/auth';
import { server } from '../../../../test/msw/server';
import { featureAccess, renderSummaries } from '../../../../test/render-summaries';
import { SummariesPrivacyCard } from './summaries-privacy-card';

vi.mock('@/shared/lib/analytics', () => ({ track: vi.fn() }));

function useConsent(state: ReturnType<typeof consentState>): void {
    server.use(http.get('*/ai/consent', (): Response => HttpResponse.json(state)));
}

describe('SummariesPrivacyCard', () => {
    it('explica o envio, inclusive o treino do provedor, e mostra o interruptor desligado', async () => {
        useConsent(consentState());
        renderSummaries(<SummariesPrivacyCard />);
        const region: HTMLElement = await screen.findByRole('region', { name: 'Resumos em texto' });
        expect(
            within(region).getByText(/escritos por um modelo de linguagem, a partir de totais agregados enviados por um serviço da Vercel/)
        ).toBeInTheDocument();
        expect(
            within(region).getByText(/usa o que recebe e o que escreve para treinar os modelos dele, sem retenção zero/)
        ).toBeInTheDocument();
        expect(await within(region).findByRole('switch', { name: 'Permitir o envio de totais agregados' })).not.toBeChecked();
        expect(within(region).getByText('Desligado, nada é enviado e os resumos somem das telas.')).toBeInTheDocument();
    });

    it('ligar grava a permissão das configurações e avisa', async () => {
        const user: UserEvent = userEvent.setup();
        let consent: ConsentState = consentState();
        let sent: unknown = null;
        server.use(
            http.get('*/ai/consent', (): Response => HttpResponse.json(consent)),
            http.put('*/ai/consent', async ({ request }): Promise<Response> => {
                sent = await request.json();
                consent = grantedConsent({ source: 'privacy_settings' });
                return HttpResponse.json(consent);
            })
        );
        renderSummaries(<SummariesPrivacyCard />);
        await user.click(await screen.findByRole('switch', { name: 'Permitir o envio de totais agregados' }));
        expect(await screen.findByText('Resumos em texto ligados')).toBeInTheDocument();
        expect(sent).toEqual({ noticeVersion: 1, source: 'privacy_settings' });
        await waitFor(() => {
            expect(screen.getByRole('switch')).toBeChecked();
        });
        expect(track).toHaveBeenCalledWith('summary_consent_granted', { source: 'privacy_settings' });
    });

    it('desligar pede confirmação e só então apaga a permissão', async () => {
        const user: UserEvent = userEvent.setup();
        let consent: ConsentState = grantedConsent();
        let revoked: boolean = false;
        server.use(
            http.get('*/ai/consent', (): Response => HttpResponse.json(consent)),
            http.delete('*/ai/consent', (): Response => {
                revoked = true;
                consent = consentState();
                return new HttpResponse(null, { status: 204 });
            })
        );
        renderSummaries(<SummariesPrivacyCard />);
        await user.click(await screen.findByRole('switch', { name: 'Permitir o envio de totais agregados' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Desligar os resumos?' });
        expect(within(dialog).getByText('Nada mais é enviado e os textos guardados são apagados.')).toBeInTheDocument();
        expect(revoked).toBe(false);
        await user.click(within(dialog).getByRole('button', { name: 'Desligar' }));
        expect(await screen.findByText('Resumos desligados. Nada mais é enviado')).toBeInTheDocument();
        expect(revoked).toBe(true);
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByRole('switch')).not.toBeChecked();
        });
        expect(track).toHaveBeenCalledWith('summary_consent_revoked');
    });

    it('cancelar a confirmação não apaga nada', async () => {
        const user: UserEvent = userEvent.setup();
        let revoked: boolean = false;
        useConsent(grantedConsent());
        server.use(
            http.delete('*/ai/consent', (): Response => {
                revoked = true;
                return new HttpResponse(null, { status: 204 });
            })
        );
        renderSummaries(<SummariesPrivacyCard />);
        await user.click(await screen.findByRole('switch'));
        await user.click(await screen.findByRole('button', { name: 'Cancelar' }));
        expect(screen.getByRole('switch')).toBeChecked();
        expect(revoked).toBe(false);
    });

    it('uma falha ao ligar vira aviso traduzido', async () => {
        const user: UserEvent = userEvent.setup();
        useConsent(consentState());
        server.use(http.put('*/ai/consent', (): Response => HttpResponse.json(problem('ai.notice_outdated', 409), { status: 409 })));
        renderSummaries(<SummariesPrivacyCard />);
        await user.click(await screen.findByRole('switch'));
        expect(await screen.findByText('O aviso mudou. Leia o pedido de novo e permita outra vez.')).toBeInTheDocument();
    });

    it('na auto-hospedada com modelo cadastrado o texto não cita a Vercel nem o treino do provedor', async () => {
        useConsent(consentState());
        renderSummaries(<SummariesPrivacyCard />, { billing: { mode: 'self_hosted' } });
        const region: HTMLElement = await screen.findByRole('region', { name: 'Resumos em texto' });
        expect(within(region).getByText(/escritos pelo modelo de linguagem que você cadastrou em Integrações/)).toBeInTheDocument();
        expect(within(region).queryByText(/Vercel|treinar/)).not.toBeInTheDocument();
    });

    it('quem só lê vê o interruptor desligado para mexer e a orientação', async () => {
        useConsent(grantedConsent({ canChange: false }));
        renderSummaries(<SummariesPrivacyCard />, { identity: { role: 'viewer' } });
        expect(await screen.findByRole('switch')).toBeDisabled();
        expect(screen.getByText('Peça a um Dono ou Editor para mudar.')).toBeInTheDocument();
    });

    it('no Free mostra "Disponível no Premium." e nenhum interruptor', async () => {
        renderSummaries(<SummariesPrivacyCard />, { billing: { plan: 'free', featureState: featureAccess('premium_required') } });
        expect(await screen.findByText('Disponível no Premium.')).toBeInTheDocument();
        expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });

    it('na auto-hospedada sem chave leva ao cadastro do modelo', async () => {
        renderSummaries(<SummariesPrivacyCard />, { billing: { mode: 'self_hosted', featureState: featureAccess('disabled') } });
        expect(await screen.findByRole('link', { name: 'Cadastrar o modelo de linguagem' })).toHaveAttribute(
            'href',
            '/settings/integrations'
        );
        expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });

    it('mostra a falha de leitura e deixa tentar de novo', async () => {
        const user: UserEvent = userEvent.setup();
        server.use(http.get('*/ai/consent', (): Response => HttpResponse.json(problem('x.boom', 500), { status: 500 })));
        renderSummaries(<SummariesPrivacyCard />);
        expect(await screen.findByText('Não deu para ver a permissão agora.')).toBeInTheDocument();
        useConsent(consentState());
        await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));
        expect(await screen.findByRole('switch')).toBeInTheDocument();
    });

    it('"Ver o que é enviado" abre abas só com os resumos que têm dados', async () => {
        const user: UserEvent = userEvent.setup();
        useConsent(consentState());
        server.use(
            http.get('*/ai/payload', ({ request }): Response => {
                const kind: string | null = new URL(request.url).searchParams.get('kind');
                return kind === 'cuts'
                    ? new HttpResponse(null, { status: 204 })
                    : HttpResponse.json(payloadBody(kind === 'portfolio' ? 'portfolio' : 'month'));
            })
        );
        renderSummaries(<SummariesPrivacyCard />);
        await user.click(await screen.findByRole('button', { name: 'Ver o que é enviado' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'O que é enviado' });
        expect(await within(dialog).findByRole('radio', { name: 'Carteira' })).toBeInTheDocument();
        expect(within(dialog).getByRole('radio', { name: 'Mês' })).toBeInTheDocument();
        expect(within(dialog).queryByRole('radio', { name: 'Cortes' })).not.toBeInTheDocument();
        expect(await within(dialog).findByText(/"gastos"/)).toBeInTheDocument();
        await user.click(within(dialog).getByRole('radio', { name: 'Carteira' }));
        expect(track).toHaveBeenCalledWith('summary_payload_viewed', { kind: 'portfolio' });
    });

    it('sem nenhum dado, o modal avisa que não há o que enviar', async () => {
        const user: UserEvent = userEvent.setup();
        useConsent(consentState());
        renderSummaries(<SummariesPrivacyCard />);
        await user.click(await screen.findByRole('button', { name: 'Ver o que é enviado' }));
        expect(await screen.findByText('Ainda não há dados para enviar.')).toBeInTheDocument();
    });
});
