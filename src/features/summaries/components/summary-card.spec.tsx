import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { track } from '@/shared/lib/analytics';
import type { ConsentState } from '../types';
import { consentState, grantedConsent, payloadBody, summaryView } from '../../../../test/fixtures/summaries';
import { problem } from '../../../../test/fixtures/auth';
import { server } from '../../../../test/msw/server';
import { featureAccess, renderSummaries } from '../../../../test/render-summaries';
import { SummaryCard } from './summary-card';

vi.mock('@/shared/lib/analytics', () => ({ track: vi.fn() }));

afterEach(() => {
    window.sessionStorage.clear();
});

function useConsent(state: ReturnType<typeof consentState>): void {
    server.use(http.get('*/ai/consent', (): Response => HttpResponse.json(state)));
}

function useSummary(view: ReturnType<typeof summaryView> | null): void {
    server.use(
        http.get('*/ai/summaries/:kind', (): Response =>
            view === null ? new HttpResponse(null, { status: 204 }) : HttpResponse.json(view)
        )
    );
}

describe('SummaryCard sem a função', () => {
    it('não mostra nada quando a função está desligada', async () => {
        const { container } = renderSummaries(<SummaryCard kind="month" month="2026-09" />, {
            billing: { featureState: featureAccess('disabled') }
        });
        await waitFor(() => {
            expect(container.querySelector('[role="region"]')).toBeNull();
        });
        expect(screen.queryByText(/Resumo de setembro/)).not.toBeInTheDocument();
    });

    it('não mostra nada enquanto o plano carrega', () => {
        renderSummaries(<SummaryCard kind="month" month="2026-09" />, { billing: { featureState: featureAccess('loading') } });
        expect(screen.queryByRole('region')).not.toBeInTheDocument();
    });

    it('não mostra nada quando a instalação não tem a função', async () => {
        useConsent(consentState({ available: false }));
        renderSummaries(<SummaryCard kind="month" month="2026-09" />);
        await waitFor(() => {
            expect(screen.queryByRole('region')).not.toBeInTheDocument();
        });
    });
});

describe('SummaryCard no Free', () => {
    it('mostra a linha do cadeado e o botão que leva ao plano', async () => {
        renderSummaries(<SummaryCard kind="month" month="2026-09" />, {
            billing: { plan: 'free', featureState: featureAccess('premium_required') }
        });
        const region: HTMLElement = await screen.findByRole('region', { name: 'Resumo de setembro.' });
        expect(within(region).getByText(/No Premium, a Vera escreve aqui um resumo destes números em 3 ou 4 frases\./)).toBeInTheDocument();
        expect(within(region).getByRole('link', { name: 'Ver o Premium' })).toHaveAttribute('href', '/settings/plan');
        expect(track).toHaveBeenCalledWith('summary_viewed', { kind: 'month', state: 'locked' });
    });

    it('pede a quem não gerencia o plano que fale com o Dono', async () => {
        renderSummaries(<SummaryCard kind="portfolio" />, {
            billing: { plan: 'free', canManage: false, featureState: featureAccess('premium_required') }
        });
        expect(await screen.findByText('Peça ao Dono da conta')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Ver o Premium' })).not.toBeInTheDocument();
    });
});

describe('SummaryCard sem permissão', () => {
    it.each([
        ['month', 'Resumo de setembro', 'O que mudou no mês e por quê.'],
        ['cuts', 'Como chegar à meta de economia', 'A conta da sugestão acima, em texto.'],
        ['portfolio', 'Resumo da carteira', 'O que está fora da meta e para onde vai o próximo aporte.']
    ] as const)('o cartão de %s pede a permissão com o texto do aviso', async (kind, title, description) => {
        useConsent(consentState());
        renderSummaries(<SummaryCard kind={kind} month="2026-09" />);
        const region: HTMLElement = await screen.findByRole('region', { name: title });
        expect(within(region).getByText(description)).toBeInTheDocument();
        expect(
            within(region).getByText(
                /Nomes de pessoas e de estabelecimentos, descrições das transações, contas e credenciais nunca são enviados\./
            )
        ).toBeInTheDocument();
        expect(within(region).getByText(/um serviço da Vercel/)).toBeInTheDocument();
        expect(
            within(region).getByText(/usa o que recebe e o que escreve para treinar os modelos dele, sem retenção zero/)
        ).toBeInTheDocument();
        expect(within(region).getByText('Dá para desligar em Configurações › Dados e privacidade.')).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('summary_viewed', { kind, state: 'consent' });
    });

    it('"Permitir e mostrar" grava a permissão do cartão e mostra o texto', async () => {
        const user: UserEvent = userEvent.setup();
        let consent: ConsentState = consentState();
        let sent: unknown = null;
        server.use(
            http.get('*/ai/consent', (): Response => HttpResponse.json(consent)),
            http.put('*/ai/consent', async ({ request }): Promise<Response> => {
                sent = await request.json();
                consent = grantedConsent();
                return HttpResponse.json(consent);
            })
        );
        useSummary(summaryView());
        renderSummaries(<SummaryCard kind="month" month="2026-09" />);
        await user.click(await screen.findByRole('button', { name: 'Permitir e mostrar' }));
        expect(await screen.findByText('Resumos em texto ligados')).toBeInTheDocument();
        expect(await screen.findByText(/R\$ 8\.420/)).toBeInTheDocument();
        expect(sent).toEqual({ noticeVersion: 1, source: 'summary_card' });
        expect(track).toHaveBeenCalledWith('summary_consent_granted', { source: 'summary_card' });
    });

    it('quem só lê não vê o botão e é mandado falar com um Dono ou Editor', async () => {
        useConsent(consentState({ canChange: false }));
        renderSummaries(<SummaryCard kind="month" month="2026-09" />, { identity: { role: 'viewer' } });
        expect(await screen.findByText('Peça a um Dono ou Editor para permitir.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Permitir e mostrar' })).not.toBeInTheDocument();
    });

    it('mostra a falha do pedido na hora, sem esconder o cartão', async () => {
        const user: UserEvent = userEvent.setup();
        useConsent(consentState());
        server.use(http.put('*/ai/consent', (): Response => HttpResponse.json(problem('ai.notice_outdated', 409), { status: 409 })));
        renderSummaries(<SummaryCard kind="month" month="2026-09" />);
        await user.click(await screen.findByRole('button', { name: 'Permitir e mostrar' }));
        expect(await screen.findByText('O aviso mudou. Leia o pedido de novo e permita outra vez.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Permitir e mostrar' })).toBeInTheDocument();
    });

    it('"Ver o que é enviado" abre o JSON montado agora', async () => {
        const user: UserEvent = userEvent.setup();
        useConsent(consentState());
        server.use(http.get('*/ai/payload', (): Response => HttpResponse.json(payloadBody('month'))));
        renderSummaries(<SummaryCard kind="month" month="2026-09" />);
        await user.click(await screen.findByRole('button', { name: 'Ver o que é enviado' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'O que é enviado' });
        expect(await within(dialog).findByText(/"gastos": "R\$ 8\.420,00"/)).toBeInTheDocument();
        expect(within(dialog).getByText(/Só números agregados, sem nomes\./)).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('summary_payload_viewed', { kind: 'month' });
        await user.click(within(dialog).getByRole('button', { name: 'Entendi' }));
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
});

describe('SummaryCard com permissão', () => {
    it('mostra os parágrafos, o negrito e a linha de quando foi escrito', async () => {
        useConsent(grantedConsent());
        useSummary(summaryView());
        renderSummaries(<SummaryCard kind="month" month="2026-09" />);
        expect(await screen.findByText('R$ 8.420')).toHaveProperty('tagName', 'STRONG');
        const region: HTMLElement = screen.getByRole('region', { name: 'Resumo de setembro' });
        expect(within(region).getByText(/Escrito hoje às \d{2}:\d{2} a partir dos totais do mês\./)).toBeInTheDocument();
        expect(within(region).getByRole('button', { name: 'O que é enviado' })).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('summary_viewed', { kind: 'month', state: 'text' });
    });

    it('escapa HTML que venha no texto', async () => {
        useConsent(grantedConsent());
        useSummary(summaryView({ paragraphs: ['<script>alert(1)</script> **R$ 1**'] }));
        const { container } = renderSummaries(<SummaryCard kind="month" month="2026-09" />);
        expect(await screen.findByText(/<script>alert\(1\)<\/script>/)).toBeInTheDocument();
        expect(container.querySelector('script')).toBeNull();
    });

    it('não mostra o cartão quando não há dados (204)', async () => {
        useConsent(grantedConsent());
        useSummary(null);
        renderSummaries(<SummaryCard kind="month" month="2026-09" />);
        await waitFor(() => {
            expect(screen.queryByRole('region')).not.toBeInTheDocument();
        });
    });

    it('dia anterior vira "em dd/mm às hh:mm"', async () => {
        useConsent(grantedConsent());
        useSummary(summaryView({ generatedAt: new Date(2026, 9, 8, 8, 12).toISOString() }));
        renderSummaries(<SummaryCard kind="month" month="2026-09" />);
        expect(await screen.findByText(/Escrito em 08\/10 às 08:12 a partir dos totais do mês\./)).toBeInTheDocument();
    });

    it('com os números mudados, avisa e põe "Escrever de novo" em destaque', async () => {
        useConsent(grantedConsent());
        useSummary(summaryView({ stale: true }));
        renderSummaries(<SummaryCard kind="month" month="2026-09" />);
        expect(await screen.findByText(/Os números mudaram depois disso\./)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Escrever de novo' }).className).toContain('bg-accent-strong');
    });

    it('"Escrever de novo" chama o regenerate com o mês e mostra o aviso', async () => {
        const user: UserEvent = userEvent.setup();
        let body: unknown = null;
        useConsent(grantedConsent());
        useSummary(summaryView());
        server.use(
            http.post('*/ai/summaries/month/regenerate', async ({ request }): Promise<Response> => {
                body = await request.json();
                return HttpResponse.json(summaryView({ paragraphs: ['Texto novo **R$ 9**'] }));
            })
        );
        renderSummaries(<SummaryCard kind="month" month="2026-09" />, { identity: { role: 'editor' } });
        await user.click(await screen.findByRole('button', { name: 'Escrever de novo' }));
        expect(await screen.findByText('Resumo escrito de novo')).toBeInTheDocument();
        expect(await screen.findByText(/Texto novo/)).toBeInTheDocument();
        expect(body).toEqual({ month: '2026-09' });
        expect(track).toHaveBeenCalledWith('summary_regenerated', { kind: 'month' });
    });

    it('quem só lê não vê "Escrever de novo"', async () => {
        useConsent(grantedConsent({ canChange: false }));
        useSummary(summaryView());
        renderSummaries(<SummaryCard kind="month" month="2026-09" />, { identity: { role: 'viewer' } });
        await screen.findByText(/R\$ 8\.420/);
        expect(screen.queryByRole('button', { name: 'Escrever de novo' })).not.toBeInTheDocument();
    });

    it('a cota pausada desliga o botão e mostra a faixa', async () => {
        useConsent(grantedConsent());
        useSummary(summaryView({ usage: { state: 'paused', usedBps: 10000, resetsAt: '2026-12-01T03:00:00.000Z' } }));
        renderSummaries(<SummaryCard kind="month" month="2026-09" />);
        expect(await screen.findByText('Pausado até 1º de dezembro')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Escrever de novo' })).toBeDisabled();
    });

    it('a cota acima de 80% mostra o aviso com a porcentagem', async () => {
        useConsent(grantedConsent());
        useSummary(summaryView({ usage: { state: 'warning', usedBps: 8500, resetsAt: '2026-12-01T03:00:00.000Z' } }));
        renderSummaries(<SummaryCard kind="month" month="2026-09" />);
        expect(await screen.findByText('85% da cota de novembro usada')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Escrever de novo' })).toBeEnabled();
    });

    it('um texto fixo (meta atingida) não oferece reescrever', async () => {
        useConsent(grantedConsent());
        useSummary(summaryView({ kind: 'cuts', source: 'fixed' }));
        renderSummaries(<SummaryCard kind="cuts" month="2026-09" />);
        await screen.findByText(/R\$ 8\.420/);
        expect(screen.queryByRole('button', { name: 'Escrever de novo' })).not.toBeInTheDocument();
    });
});

describe('SummaryCard parâmetros', () => {
    it('Onde cortar manda o mês e a meta simulada', async () => {
        const urls: URL[] = [];
        useConsent(grantedConsent());
        server.use(
            http.get('*/ai/summaries/cuts', ({ request }): Response => {
                urls.push(new URL(request.url));
                return HttpResponse.json(summaryView({ kind: 'cuts' }));
            })
        );
        renderSummaries(<SummaryCard kind="cuts" month="2026-09" goalBps={2500} />);
        await screen.findByText(/R\$ 8\.420/);
        expect(urls[0]?.searchParams.get('month')).toBe('2026-09');
        expect(urls[0]?.searchParams.get('goalBps')).toBe('2500');
        expect(urls[0]?.searchParams.get('contributionMinor')).toBeNull();
    });

    it('a carteira manda o último aporte digitado na sessão', async () => {
        const urls: URL[] = [];
        window.sessionStorage.setItem('vera.contribution-amount.company-1', '1000000');
        useConsent(grantedConsent());
        server.use(
            http.get('*/ai/summaries/portfolio', ({ request }): Response => {
                urls.push(new URL(request.url));
                return HttpResponse.json(summaryView({ kind: 'portfolio' }));
            })
        );
        renderSummaries(<SummaryCard kind="portfolio" />);
        await screen.findByText(/R\$ 8\.420/);
        expect(urls[0]?.searchParams.get('contributionMinor')).toBe('1000000');
        expect(urls[0]?.searchParams.get('month')).toBeNull();
    });

    it('a carteira omite o aporte quando ninguém digitou um', async () => {
        const urls: URL[] = [];
        useConsent(grantedConsent());
        server.use(
            http.get('*/ai/summaries/portfolio', ({ request }): Response => {
                urls.push(new URL(request.url));
                return HttpResponse.json(summaryView({ kind: 'portfolio' }));
            })
        );
        renderSummaries(<SummaryCard kind="portfolio" />);
        await screen.findByText(/R\$ 8\.420/);
        expect(urls[0]?.searchParams.get('contributionMinor')).toBeNull();
    });
});

describe('SummaryCard erros', () => {
    function failSummary(type: string, status: number): void {
        server.use(http.get('*/ai/summaries/:kind', (): Response => HttpResponse.json(problem(type, status), { status })));
    }

    it.each([
        ['ai.provider_unavailable', 503, 'Não deu para escrever o resumo agora. Os números da tela continuam certos.'],
        ['ai.invalid_response', 502, 'Não deu para escrever o resumo agora. Os números da tela continuam certos.'],
        ['usage.cap_reached', 402, 'Resumos pausados até 1º de dezembro. A cota do mês acabou; o resto da Vera segue normal.'],
        ['x.unknown', 500, 'Não deu para mostrar o resumo agora. Tente de novo em instantes.']
    ])('%s aparece dentro do cartão, traduzido', async (type, status, message) => {
        useConsent(grantedConsent());
        failSummary(type, status);
        renderSummaries(<SummaryCard kind="month" month="2026-09" />, {
            billing: {
                usage: {
                    usedBps: 10000,
                    state: 'paused',
                    resetsAt: '2026-12-01T03:00:00.000Z',
                    byFeature: { ai: { usedBps: 10000 }, whatsapp: { usedBps: 0 } },
                    capMicros: null
                }
            }
        });
        expect(await screen.findByText(message)).toBeInTheDocument();
        expect(screen.queryByText('detalhe técnico que não vai para a tela')).not.toBeInTheDocument();
    });

    it('ai.consent_required volta ao pedido de permissão', async () => {
        let consent: ConsentState = grantedConsent();
        server.use(http.get('*/ai/consent', (): Response => HttpResponse.json(consent)));
        server.use(
            http.get('*/ai/summaries/:kind', (): Response => {
                consent = consentState();
                return HttpResponse.json(problem('ai.consent_required', 403), { status: 403 });
            })
        );
        renderSummaries(<SummaryCard kind="month" month="2026-09" />);
        expect(await screen.findByRole('button', { name: 'Permitir e mostrar' })).toBeInTheDocument();
    });

    it.each([
        [
            'ai.repeated_request',
            429,
            'Este resumo já foi escrito várias vezes hoje com os mesmos números. Ele muda quando os números mudarem.'
        ],
        ['core.too_many_attempts', 429, 'Você pediu muitos resumos nesta hora. Tente de novo mais tarde.']
    ])('"Escrever de novo" mostra %s sem esconder o texto', async (type, status, message) => {
        const user: UserEvent = userEvent.setup();
        useConsent(grantedConsent());
        useSummary(summaryView());
        server.use(http.post('*/ai/summaries/month/regenerate', (): Response => HttpResponse.json(problem(type, status), { status })));
        renderSummaries(<SummaryCard kind="month" month="2026-09" />, { identity: { role: 'editor' } });
        await user.click(await screen.findByRole('button', { name: 'Escrever de novo' }));
        expect(await screen.findByText(message)).toBeInTheDocument();
        expect(screen.getByText(/R\$ 8\.420/)).toBeInTheDocument();
    });
});
