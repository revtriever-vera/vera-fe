import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { track } from '@/shared/lib/analytics';
import { i18n } from '@/shared/lib/i18n';
import type { ConnectionView } from '@/features/spending/types';
import { http, HttpResponse } from 'msw';
import { installConnectionsApi, type ConnectionsApiOptions } from '../../../../../test/helpers/connections-api';
import { problemBody } from '../../../../../test/helpers/rules-api';
import { sessionIdentity } from '../../../../../test/fixtures/auth';
import { server } from '../../../../../test/msw/server';
import { renderRouterAt } from '../../../../../test/router';
import { openConnectionsPage } from '../../../../../test/helpers/open-connections';
import { connectionView, validCredentials } from '../../../../../test/fixtures/spending';

function withConnections(...connections: ConnectionView[]): ConnectionsApiOptions {
    return { credentials: validCredentials({ clientIdHint: '3f9a…c2e1' }), connections };
}

afterEach(() => {
    window.localStorage.clear();
    void i18n.changeLanguage('pt-BR');
});

describe('ConnectionsPage: bancos conectados', () => {
    it('mostra tile com iniciais, contas mascaradas, status e hora de hoje', async () => {
        const recent: string = new Date().toISOString();
        await openConnectionsPage(withConnections(connectionView({ lastSuccessAt: recent })));

        const row: HTMLElement = (await screen.findByText('Itaú', { selector: 'b' })).closest('li') as HTMLElement;
        expect(within(row).getByText('It')).toBeInTheDocument();
        expect(within(row).getByText('Itaú Conta •••• 1098')).toBeInTheDocument();
        expect(within(row).getByText('ativo')).toBeInTheDocument();
        expect(within(row).getByText(/^atualizado hoje, /)).toBeInTheDocument();
    });

    it('mostra a data completa quando a última atualização foi em outro dia', async () => {
        await openConnectionsPage(withConnections(connectionView({ lastSuccessAt: '2026-08-01T10:00:00.000Z' })));

        expect(await screen.findByText(/^atualizado em /)).toBeInTheDocument();
    });

    it('avisa quando o consentimento vence em menos de 30 dias', async () => {
        const soon: string = new Date(Date.now() + 10 * 86_400_000).toISOString();
        await openConnectionsPage(withConnections(connectionView({ consentExpiresAt: soon })));

        expect(await screen.findByText(/^o consentimento vence em \d{2}\/\d{2}$/)).toBeInTheDocument();
    });

    it('mostra o estado vazio sem bancos', async () => {
        await openConnectionsPage({ credentials: validCredentials() });

        expect(await screen.findByText('Nenhum banco conectado ainda.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Sincronizar tudo' })).not.toBeInTheDocument();
    });

    it('mostra a falha ao carregar e tenta de novo', async () => {
        server.use(http.get('*/spending/connections', () => HttpResponse.json(problemBody('x.fail', 400), { status: 400 })));
        renderRouterAt('/spending/connections', { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar as conexões.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    });
});

describe('ConnectionsPage: ajuda por status', () => {
    it('login_error leva ao passo 2 e abre o tutorial recolhido', async () => {
        const { user } = await openConnectionsPage(
            withConnections(connectionView({ status: 'needs_attention', statusReason: 'login_error' }))
        );

        expect(await screen.findByText('precisa de atenção')).toBeInTheDocument();
        expect(screen.getByText('Abra o Meu Pluggy e reconecte este banco.')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Ver o passo 2' }));

        const heading: HTMLElement = await screen.findByRole('heading', { name: 'Conecte cada banco pelo Open Finance' });
        await waitFor(() => {
            expect(heading).toHaveFocus();
        });
    });

    it('waiting_user_input pede a confirmação no Meu Pluggy', async () => {
        await openConnectionsPage(withConnections(connectionView({ status: 'needs_attention', statusReason: 'waiting_user_input' })));

        expect(await screen.findByText('O banco pediu uma confirmação no Meu Pluggy.')).toBeInTheDocument();
    });

    it('revoked pede para autorizar de novo na Demo e leva ao passo 4', async () => {
        await openConnectionsPage(withConnections(connectionView({ status: 'revoked' })));

        expect(await screen.findByText('acesso revogado')).toBeInTheDocument();
        expect(screen.getByText('Autorize de novo na Demo da sua aplicação e cole o novo Item ID.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ver o passo 4' })).toBeInTheDocument();
    });

    it('paused pede para trocar a credencial e abre o formulário de troca', async () => {
        const { user } = await openConnectionsPage(
            withConnections(connectionView({ status: 'paused', statusReason: 'credentials_invalid' }))
        );

        expect(await screen.findByText('pausado')).toBeInTheDocument();
        const row: HTMLElement = screen.getByText('pausado').closest('li') as HTMLElement;
        await user.click(within(row).getByRole('button', { name: 'Trocar credencial' }));

        expect(await screen.findByLabelText('Client Secret')).toBeInTheDocument();
    });

    it('mostra o resultado da última execução quando ela falhou', async () => {
        await openConnectionsPage(
            withConnections(
                connectionView({
                    lastRun: {
                        trigger: 'daily',
                        status: 'failed',
                        startedAt: '2026-10-01T12:00:00.000Z',
                        finishedAt: null,
                        inserted: 0,
                        failureCode: 'x'
                    }
                })
            )
        );

        expect(await screen.findByText('A última atualização falhou.')).toBeInTheDocument();
    });
});

describe('ConnectionsPage: sincronizar e remover', () => {
    it('desabilita o botão da linha que está sincronizando', async () => {
        await openConnectionsPage(withConnections(connectionView({ syncing: true })));

        expect(await screen.findByRole('button', { name: /Sincronizar agora/ })).toBeDisabled();
        expect(screen.getByText('sincronizando…')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sincronizar tudo' })).toBeDisabled();
    });

    it('pede a atualização de uma conexão', async () => {
        const { user, api } = await openConnectionsPage(withConnections(connectionView()));

        await user.click(await screen.findByRole('button', { name: /Sincronizar agora Itaú/ }));

        expect(await screen.findByText('Atualização pedida')).toBeInTheDocument();
        expect(api.syncs).toEqual(['conn-itau']);
        expect(track).toHaveBeenCalledWith('spending_sync_requested', { scope: 'one' });
    });

    it('o 409 vira um toast neutro', async () => {
        const { user } = await openConnectionsPage({ ...withConnections(connectionView()), syncStatus: 409 });

        await user.click(await screen.findByRole('button', { name: /Sincronizar agora Itaú/ }));

        expect(await screen.findByText('Já existe uma atualização em andamento para essa conexão.')).toBeInTheDocument();
    });

    it('o 503 vira um toast crítico com o motivo', async () => {
        const { user } = await openConnectionsPage({ ...withConnections(connectionView()), syncStatus: 503 });

        await user.click(await screen.findByRole('button', { name: /Sincronizar agora Itaú/ }));

        expect(await screen.findByText('Não foi possível pedir a atualização')).toBeInTheDocument();
        expect(screen.getByText('Não foi possível pedir a atualização agora. Tente de novo em instantes.')).toBeInTheDocument();
    });

    it('"Sincronizar tudo" com 503 mostra o toast crítico', async () => {
        const { user } = await openConnectionsPage({ ...withConnections(connectionView()), syncStatus: 503 });

        await user.click(await screen.findByRole('button', { name: 'Sincronizar tudo' }));

        expect(await screen.findByText('Não foi possível pedir a atualização agora. Tente de novo em instantes.')).toBeInTheDocument();
    });

    it('"Sincronizar tudo" chama a rota geral', async () => {
        const { user, api } = await openConnectionsPage(withConnections(connectionView(), connectionView({ id: 'conn-2' })));

        await user.click(await screen.findByRole('button', { name: 'Sincronizar tudo' }));

        expect(await screen.findByText('2 bancos na fila para atualizar')).toBeInTheDocument();
        expect(api.syncAll).toBe(1);
        expect(track).toHaveBeenCalledWith('spending_sync_requested', { scope: 'all' });
    });

    it('"Sincronizar tudo" com 409 mostra o toast neutro', async () => {
        const { user } = await openConnectionsPage({ ...withConnections(connectionView()), syncStatus: 409 });

        await user.click(await screen.findByRole('button', { name: 'Sincronizar tudo' }));

        expect(await screen.findByText('Já existe uma atualização em andamento para essa conexão.')).toBeInTheDocument();
    });

    it('remover um banco pede confirmação e respeita a caixa de apagar', async () => {
        const { user, api } = await openConnectionsPage(withConnections(connectionView()));

        await user.click(await screen.findByRole('button', { name: /Remover Itaú/ }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Remover Itaú?' });
        await user.click(within(dialog).getByRole('checkbox'));
        await user.click(within(dialog).getByRole('button', { name: 'Remover e apagar' }));

        expect(await screen.findByText('Banco removido')).toBeInTheDocument();
        expect(api.removedConnections).toEqual([{ id: 'conn-itau', purge: 'true' }]);
    });

    it('remover sem marcar a caixa mantém as transações', async () => {
        const { user, api } = await openConnectionsPage(withConnections(connectionView()));

        await user.click(await screen.findByRole('button', { name: /Remover Itaú/ }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Remover' }));

        await waitFor(() => {
            expect(api.removedConnections).toEqual([{ id: 'conn-itau', purge: 'false' }]);
        });
    });
});

describe('ConnectionsPage: passo a passo', () => {
    it('lembra os passos marcados e registra o evento só ao marcar', async () => {
        const { user } = await openConnectionsPage();

        await user.click(await screen.findByRole('checkbox', { name: 'Marcar o passo 2 como feito' }));

        expect(track).toHaveBeenCalledWith('spending_tutorial_step_checked', { step: 2 });
        expect(window.localStorage.getItem('vera.spending.tutorial.company-1')).toBe('[2]');
        await user.click(screen.getByRole('checkbox', { name: 'Marcar o passo 2 como feito' }));
        expect(window.localStorage.getItem('vera.spending.tutorial.company-1')).toBe('[]');
    });

    it('funciona quando o armazenamento lança erro', async () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('bloqueado');
        });
        const { user } = await openConnectionsPage();

        await user.click(await screen.findByRole('checkbox', { name: 'Marcar o passo 1 como feito' }));

        expect(screen.getByRole('checkbox', { name: 'Marcar o passo 1 como feito' })).toBeChecked();
        vi.restoreAllMocks();
    });
});

describe('ConnectionsPage: idioma e ambiente', () => {
    it('oferece "Preencher exemplo" em desenvolvimento e preenche os campos', async () => {
        const { user } = await openConnectionsPage();

        await user.click(await screen.findByRole('button', { name: 'Preencher exemplo' }));

        expect(screen.getByLabelText('Client ID')).not.toHaveValue('');
        expect(screen.getByLabelText('Item IDs')).toHaveDisplayValue(/00000000-0000-4000-8000-00000000a001/);
    });

    it('não oferece "Preencher exemplo" fora do desenvolvimento', async () => {
        vi.stubEnv('DEV', false);
        await openConnectionsPage();

        expect(screen.queryByRole('button', { name: 'Preencher exemplo' })).not.toBeInTheDocument();
        vi.unstubAllEnvs();
    });

    it('aparece em inglês', async () => {
        installConnectionsApi();
        server.use(
            http.post('*/auth/refresh', () => HttpResponse.json({ outcome: 'authenticated', accessToken: 'access-token-1' })),
            http.get('*/auth/me', () => HttpResponse.json(sessionIdentity({ locale: 'en' })))
        );
        renderRouterAt('/spending/connections');

        expect(await screen.findByRole('region', { name: 'Your credentials' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Meu Pluggy step by step' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Test and connect' })).toBeInTheDocument();
    });
});
