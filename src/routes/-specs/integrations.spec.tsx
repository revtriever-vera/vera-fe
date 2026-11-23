import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import type { IntegrationKind } from '@/features/integrations/types';
import * as analytics from '@/shared/lib/analytics';
import { tokenStore } from '@/shared/lib/api/token-store';
import { problem, sessionIdentity } from '../../../test/fixtures/auth';
import { selfHostedBilling } from '../../../test/fixtures/billing';
import { integrationItem, integrationsView, REDIRECT_URL, WEBHOOK_URL } from '../../../test/fixtures/integrations';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';
import { lastRenderedClient } from '../../../test/rendered-clients';

const API_KEY: string = 'sk-segredo-de-teste-123';

interface Calls {
    list: number;
    billing: number;
    saved: unknown[];
    removed: string[];
}

function mockInstallation(configured: readonly IntegrationKind[] = [], role: 'owner' | 'viewer' = 'owner'): Calls {
    const calls: Calls = { list: 0, billing: 0, saved: [], removed: [] };
    let current: readonly IntegrationKind[] = configured;
    server.use(
        http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ role }))),
        ...signedInHandlers(),
        http.get('*/billing/me', (): Response => {
            calls.billing += 1;
            return HttpResponse.json(selfHostedBilling());
        }),
        http.get('*/integrations', (): Response => {
            calls.list += 1;
            return HttpResponse.json(integrationsView(current));
        }),
        http.put('*/integrations/:kind', async ({ request, params }): Promise<Response> => {
            calls.saved.push(await request.json());
            const kind: IntegrationKind = params['kind'] as IntegrationKind;
            current = [...current, kind];
            return HttpResponse.json(integrationItem(kind, true));
        }),
        http.delete('*/integrations/:kind', ({ params }): Response => {
            const kind: IntegrationKind = params['kind'] as IntegrationKind;
            calls.removed.push(kind);
            current = current.filter((item: IntegrationKind): boolean => item !== kind);
            return new HttpResponse(null, { status: 204 });
        })
    );
    return calls;
}

async function openTab(): Promise<AnyRouter> {
    const router: AnyRouter = renderRouterAt('/settings/integrations');
    await screen.findByRole('heading', { name: 'Configurações', level: 1 });
    return router;
}

async function rowOf(name: string): Promise<HTMLElement> {
    const title: HTMLElement = await screen.findByText(name, { selector: 'span.flex' });
    return title.closest('li') as HTMLElement;
}

async function fillLlm(user: UserEvent, dialog: HTMLElement, model: string = 'modelo-exemplo'): Promise<void> {
    await user.type(within(dialog).getByLabelText('URL da API'), 'https://llm.example.test/v1');
    await user.type(within(dialog).getByLabelText('Chave'), API_KEY);
    await user.type(within(dialog).getByLabelText('Modelo'), model);
}

function failTest(reason: string): void {
    server.use(
        http.put('*/integrations/:kind', (): Response =>
            HttpResponse.json({ ...problem('integrations.test_failed', 422), meta: { reason } }, { status: 422 })
        )
    );
}

afterEach((): void => {
    tokenStore.set(null);
    vi.restoreAllMocks();
});

describe('aba Integrações: lista', () => {
    it('é a primeira aba da auto-hospedada e mostra as três linhas sem chave', async () => {
        mockInstallation();
        const router: AnyRouter = renderRouterAt('/settings', { signedIn: true });
        mockInstallation();

        await screen.findByRole('region', { name: 'Integrações' });

        expect(router.state.location.pathname).toBe('/settings/integrations');
        expect(screen.queryByRole('link', { name: 'Plano e uso' })).not.toBeInTheDocument();
        for (const name of ['Modelo de linguagem', 'WhatsApp', 'Google Agenda']) {
            const row: HTMLElement = await rowOf(name);
            expect(within(row).getByText('sem chave')).toBeInTheDocument();
            expect(within(row).getByRole('button', { name: `Cadastrar a chave de ${name}` })).toBeInTheDocument();
        }
    });

    it('mostra Trocar e Remover onde há chave', async () => {
        mockInstallation(['llm', 'google']);
        await openTab();

        const row: HTMLElement = await rowOf('Modelo de linguagem');

        expect(within(row).getByText('configurada')).toBeInTheDocument();
        expect(within(row).getByRole('button', { name: 'Trocar a chave de Modelo de linguagem' })).toBeInTheDocument();
        expect(within(row).getByRole('button', { name: 'Remover a chave de Modelo de linguagem' })).toBeInTheDocument();
        expect(within(await rowOf('WhatsApp')).getByText('sem chave')).toBeInTheDocument();
    });

    it('avisa que o WhatsApp precisa do modelo enquanto o modelo não está configurado', async () => {
        mockInstallation(['whatsapp']);
        await openTab();

        expect(within(await rowOf('WhatsApp')).getByText('Precisa também do modelo de linguagem')).toBeInTheDocument();
    });

    it('não avisa quando o modelo está configurado', async () => {
        mockInstallation(['llm']);
        await openTab();

        await rowOf('WhatsApp');
        expect(screen.queryByText('Precisa também do modelo de linguagem')).not.toBeInTheDocument();
    });

    it('esconde os botões e não chama a API para quem não é Dono', async () => {
        const calls: Calls = mockInstallation([], 'viewer');
        await openTab();

        expect(await screen.findByText('Só o Dono da conta cadastra, troca e remove as chaves.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /chave de/ })).not.toBeInTheDocument();
        expect(calls.list).toBe(0);
    });

    it('mostra o erro quando a lista não carrega', async () => {
        mockInstallation();
        server.use(
            http.get('*/integrations', (): Response => HttpResponse.json(problem('integrations.not_available', 404), { status: 404 }))
        );
        await openTab();

        expect(await screen.findByText('As chaves só se cadastram em uma instalação auto-hospedada.')).toBeInTheDocument();
    });
});

describe('aba Integrações: salvar e testar', () => {
    it('salva o modelo, avisa, fecha o modal e atualiza a lista e o plano', async () => {
        const track: MockInstance<typeof analytics.track> = vi.spyOn(analytics, 'track');
        const calls: Calls = mockInstallation();
        const user: UserEvent = userEvent.setup();
        await openTab();
        await user.click(await screen.findByRole('button', { name: 'Cadastrar a chave de Modelo de linguagem' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Modelo de linguagem' });
        const billingBefore: number = calls.billing;

        await fillLlm(user, dialog);
        await user.click(within(dialog).getByRole('button', { name: 'Salvar e testar' }));

        expect(await screen.findByText('Modelo de linguagem: conectado')).toBeInTheDocument();
        expect(calls.saved).toEqual([{ baseUrl: 'https://llm.example.test/v1', apiKey: API_KEY, model: 'modelo-exemplo' }]);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(within(await rowOf('Modelo de linguagem')).getByText('configurada')).toBeInTheDocument();
        await waitFor((): void => {
            expect(calls.billing).toBeGreaterThan(billingBefore);
        });
        expect(track).toHaveBeenCalledWith('integration_saved', { kind: 'llm' });
    });

    it('as senhas ficam em campos de senha sem preenchimento automático', async () => {
        mockInstallation();
        const user: UserEvent = userEvent.setup();
        await openTab();
        await user.click(await screen.findByRole('button', { name: 'Cadastrar a chave de WhatsApp' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'WhatsApp' });

        for (const label of ['Token de acesso', 'Token de verificação do webhook', 'App secret']) {
            expect(within(dialog).getByLabelText(label)).toHaveAttribute('type', 'password');
            expect(within(dialog).getByLabelText(label)).toHaveAttribute('autocomplete', 'off');
        }
        expect(within(dialog).getByLabelText('ID do número')).toHaveAttribute('type', 'text');
    });

    it.each([
        ['unauthorized', 'A chave foi recusada.'],
        ['invalid_model', 'Modelo não encontrado nesse provedor.'],
        ['unreachable', 'Não foi possível chegar à URL da API.']
    ])('mostra a mensagem do motivo %s e mantém o modal aberto', async (reason: string, message: string) => {
        const track: MockInstance<typeof analytics.track> = vi.spyOn(analytics, 'track');
        mockInstallation();
        failTest(reason);
        const user: UserEvent = userEvent.setup();
        await openTab();
        await user.click(await screen.findByRole('button', { name: 'Cadastrar a chave de Modelo de linguagem' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Modelo de linguagem' });

        await fillLlm(user, dialog);
        await user.click(within(dialog).getByRole('button', { name: 'Salvar e testar' }));

        expect(await within(dialog).findByText(message)).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('integration_test_failed', { kind: 'llm', reason });
        expect(track).not.toHaveBeenCalledWith('integration_saved', expect.anything());
    });

    it('mostra o número já usado em outra conta', async () => {
        mockInstallation();
        server.use(
            http.put('*/integrations/whatsapp', (): Response =>
                HttpResponse.json(problem('integrations.phone_in_use', 409), { status: 409 })
            )
        );
        const user: UserEvent = userEvent.setup();
        await openTab();
        await user.click(await screen.findByRole('button', { name: 'Cadastrar a chave de WhatsApp' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'WhatsApp' });

        await user.type(within(dialog).getByLabelText('Token de acesso'), 'EAAG-token-de-teste');
        await user.type(within(dialog).getByLabelText('ID do número'), '109876543210');
        await user.type(within(dialog).getByLabelText('Token de verificação do webhook'), 'verifica-teste-1');
        await user.type(within(dialog).getByLabelText('App secret'), 'app-secret-teste');
        await user.click(within(dialog).getByRole('button', { name: 'Salvar e testar' }));

        expect(await within(dialog).findByText('Esse número já está ligado a outra conta.')).toBeInTheDocument();
    });

    it('valida os campos antes de enviar', async () => {
        const calls: Calls = mockInstallation();
        const user: UserEvent = userEvent.setup();
        await openTab();
        await user.click(await screen.findByRole('button', { name: 'Cadastrar a chave de Google Agenda' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Google Agenda' });

        await user.type(within(dialog).getByLabelText('Client ID'), 'qualquer-coisa');
        await user.type(within(dialog).getByLabelText('Client Secret'), 'curto');
        await user.click(within(dialog).getByRole('button', { name: 'Salvar e testar' }));

        expect(await within(dialog).findByText('O Client ID termina em .apps.googleusercontent.com.')).toBeInTheDocument();
        expect(within(dialog).getByText('Use de 8 a 512 caracteres, sem espaços.')).toBeInTheDocument();
        expect(calls.saved).toEqual([]);
    });

    it('mostra as URLs do webhook e do redirecionamento, vindas da API', async () => {
        mockInstallation();
        const user: UserEvent = userEvent.setup();
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Cadastrar a chave de WhatsApp' }));
        expect(within(await screen.findByRole('dialog', { name: 'WhatsApp' })).getByText(WEBHOOK_URL)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Cancelar' }));

        await user.click(screen.getByRole('button', { name: 'Cadastrar a chave de Google Agenda' }));
        expect(within(await screen.findByRole('dialog', { name: 'Google Agenda' })).getByText(REDIRECT_URL)).toBeInTheDocument();
    });
});

describe('aba Integrações: trocar', () => {
    it('pré-preenche só os campos públicos e mostra o fim da chave atual', async () => {
        mockInstallation(['llm']);
        const user: UserEvent = userEvent.setup();
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Trocar a chave de Modelo de linguagem' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Modelo de linguagem' });

        expect(within(dialog).getByLabelText('URL da API')).toHaveValue('https://llm.example.test/v1');
        expect(within(dialog).getByLabelText('Modelo')).toHaveValue('modelo-exemplo');
        expect(within(dialog).getByLabelText('Chave')).toHaveValue('');
        expect(within(dialog).getByText('A chave atual termina em 1a2b. Digite de novo para trocar.')).toBeInTheDocument();
    });

    it('não deixa nenhum segredo no cache do QueryClient depois de salvar', async () => {
        mockInstallation();
        const user: UserEvent = userEvent.setup();
        await openTab();
        await user.click(await screen.findByRole('button', { name: 'Cadastrar a chave de Modelo de linguagem' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Modelo de linguagem' });

        await fillLlm(user, dialog);
        await user.click(within(dialog).getByRole('button', { name: 'Salvar e testar' }));
        await screen.findByText('Modelo de linguagem: conectado');

        const client = lastRenderedClient();
        const cached: string = JSON.stringify([
            client
                ?.getQueryCache()
                .getAll()
                .map((query) => query.state.data),
            client
                ?.getMutationCache()
                .getAll()
                .map((mutation) => [mutation.state.variables, mutation.state.data])
        ]);
        expect(cached).not.toContain(API_KEY);
    });
});

describe('aba Integrações: remover', () => {
    it.each([
        ['Modelo de linguagem', 'llm', 'Os resumos em texto somem das telas.'],
        ['WhatsApp', 'whatsapp', 'O WhatsApp para de responder e os lembretes são cancelados.'],
        ['Google Agenda', 'google', 'A agenda é desconectada.']
    ] as const)('confirma com o texto de %s e remove', async (name: string, kind: IntegrationKind, warning: string) => {
        const track: MockInstance<typeof analytics.track> = vi.spyOn(analytics, 'track');
        const calls: Calls = mockInstallation(['llm', 'whatsapp', 'google']);
        const user: UserEvent = userEvent.setup();
        await openTab();

        await user.click(await screen.findByRole('button', { name: `Remover a chave de ${name}` }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: `Remover a chave de ${name}?` });
        expect(within(dialog).getByText(warning)).toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Remover a chave' }));

        expect(await screen.findByText('Chave removida: a função some do app')).toBeInTheDocument();
        expect(calls.removed).toEqual([kind]);
        await waitFor((): void => {
            expect(
                within(screen.getByText(name, { selector: 'span.flex' }).closest('li') as HTMLElement).getByText('sem chave')
            ).toBeInTheDocument();
        });
        expect(track).toHaveBeenCalledWith('integration_removed', { kind });
    });

    it('cancelar não remove nada', async () => {
        const calls: Calls = mockInstallation(['llm']);
        const user: UserEvent = userEvent.setup();
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Remover a chave de Modelo de linguagem' }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(calls.removed).toEqual([]);
    });
});
