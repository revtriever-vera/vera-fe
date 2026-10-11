import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { track } from '@/shared/lib/analytics';
import { ITEM_NUBANK, type ConnectionsApiOptions } from '../../../../../test/helpers/connections-api';
import { openConnectionsPage, fillConnectionsForm, submitConnectionsForm } from '../../../../../test/helpers/open-connections';
import { canonicalConnections, connectionView, validCredentials } from '../../../../../test/fixtures/spending';

const CONFIGURED: ConnectionsApiOptions = {
    credentials: validCredentials({ clientIdHint: '3f9a…c2e1' }),
    connections: canonicalConnections().connections
};

afterEach(() => {
    window.localStorage.clear();
});

describe('ConnectionsPage: credencial configurada', () => {
    it('mostra a dica mascarada, o selo de status e nunca um campo de segredo', async () => {
        await openConnectionsPage(CONFIGURED);

        expect(await screen.findByText('3f9a…c2e1')).toBeInTheDocument();
        expect(screen.getByText('Credencial do Meu Pluggy')).toBeInTheDocument();
        expect(screen.getByText('válida')).toBeInTheDocument();
        expect(screen.queryByLabelText('Client Secret')).not.toBeInTheDocument();
    });

    it('começa com o tutorial recolhido e abre pelo botão', async () => {
        const { user } = await openConnectionsPage(CONFIGURED);

        const toggle: HTMLElement = await screen.findByRole('button', { name: 'Ver passo a passo' });
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByText('Crie sua conta no Meu Pluggy')).not.toBeInTheDocument();
        await user.click(toggle);

        expect(screen.getByText('Crie sua conta no Meu Pluggy')).toBeVisible();
        expect(screen.getByRole('button', { name: 'Ocultar passo a passo' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('"Testar de novo" atualiza a data de verificação', async () => {
        const { user, api } = await openConnectionsPage(CONFIGURED);

        await user.click(await screen.findByRole('button', { name: 'Testar de novo' }));

        expect(await screen.findByText(/verificada em 11\/10\/2026/)).toBeInTheDocument();
        expect(api.tests).toBe(1);
        expect(await screen.findByText('Credencial verificada')).toBeInTheDocument();
    });

    it('"Trocar credencial" abre o formulário sem o campo de Item IDs e não reenvia bancos', async () => {
        const { user, api } = await openConnectionsPage(CONFIGURED);

        await user.click(await screen.findByRole('button', { name: 'Trocar credencial' }));

        expect(screen.getByLabelText('Client Secret')).toHaveValue('');
        expect(screen.queryByLabelText('Item IDs')).not.toBeInTheDocument();
        await user.type(screen.getByLabelText('Client ID'), '3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6b');
        await user.type(screen.getByLabelText('Client Secret'), 'nova-chave-qualquer');
        await user.click(screen.getByRole('button', { name: 'Salvar nova credencial' }));

        expect(await screen.findByRole('button', { name: 'Trocar credencial' })).toBeEnabled();
        expect(api.saved).toHaveLength(1);
        expect(api.added).toEqual([]);
        expect(screen.queryByLabelText('Client Secret')).not.toBeInTheDocument();
    });

    it('"Adicionar bancos" abre só o campo de Item IDs', async () => {
        const { user, api } = await openConnectionsPage(CONFIGURED);

        await user.click(await screen.findByRole('button', { name: 'Adicionar bancos' }));
        expect(screen.queryByLabelText('Client ID')).not.toBeInTheDocument();
        await user.click(screen.getByLabelText('Item IDs'));
        await user.paste(ITEM_NUBANK);
        await user.click(screen.getByRole('button', { name: 'Conectar bancos' }));

        expect(await screen.findByText(/Conectado: Nubank/)).toBeInTheDocument();
        expect(api.saved).toEqual([]);
        expect(api.added).toEqual([[ITEM_NUBANK]]);
    });

    it('cancelar fecha o formulário de troca', async () => {
        const { user } = await openConnectionsPage(CONFIGURED);

        await user.click(await screen.findByRole('button', { name: 'Trocar credencial' }));
        await user.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(screen.queryByLabelText('Client Secret')).not.toBeInTheDocument();
    });
});

describe('ConnectionsPage: remover credencial', () => {
    it('pede confirmação, nomeia a consequência e não apaga as transações por padrão', async () => {
        const { user, api } = await openConnectionsPage(CONFIGURED);

        await user.click(await screen.findByRole('button', { name: 'Remover credencial' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Remover a credencial do Meu Pluggy?' });
        expect(within(dialog).getByText(/As transações já importadas continuam aqui/)).toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Remover credencial' }));

        expect(await screen.findByText('Credencial removida')).toBeInTheDocument();
        expect(api.removedCredentials).toEqual(['false']);
        expect(track).toHaveBeenCalledWith('spending_credentials_removed');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('a caixa de apagar manda purgeTransactions=true e muda o botão', async () => {
        const { user, api } = await openConnectionsPage(CONFIGURED);

        await user.click(await screen.findByRole('button', { name: 'Remover credencial' }));
        const dialog: HTMLElement = await screen.findByRole('dialog');
        await user.click(within(dialog).getByRole('checkbox', { name: 'Apagar também as transações que vieram do Meu Pluggy' }));
        await user.click(within(dialog).getByRole('button', { name: 'Remover e apagar' }));

        expect(await screen.findByText('Credencial removida')).toBeInTheDocument();
        expect(api.removedCredentials).toEqual(['true']);
    });

    it('devolve o foco ao botão ao cancelar', async () => {
        const { user } = await openConnectionsPage(CONFIGURED);

        const trigger: HTMLElement = await screen.findByRole('button', { name: 'Remover credencial' });
        await user.click(trigger);
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }));

        expect(trigger).toHaveFocus();
    });
});

describe('ConnectionsPage: credencial inválida', () => {
    it('avisa no topo que as conexões estão pausadas', async () => {
        await openConnectionsPage({
            credentials: validCredentials({ status: 'invalid' }),
            connections: [connectionView({ status: 'paused', statusReason: 'credentials_invalid' })]
        });

        expect(await screen.findByText('Sua credencial do Meu Pluggy deixou de funcionar')).toBeInTheDocument();
        expect(screen.getByText('As conexões estão pausadas até você trocar a credencial.')).toBeInTheDocument();
        expect(screen.getByText('inválida')).toBeInTheDocument();
    });
});

describe('ConnectionsPage: segredo', () => {
    it('não fica em storage, no track nem no DOM depois do envio', async () => {
        const sentinel: string = 'sentinel-secret-9d41f0c2';
        const { user } = await openConnectionsPage();

        await fillConnectionsForm(user, sentinel);
        await submitConnectionsForm(user);
        await screen.findByText(/Conectado: Nubank/);

        const stored: string = JSON.stringify(Object.entries(window.localStorage)) + JSON.stringify(Object.entries(window.sessionStorage));
        expect(stored).not.toContain(sentinel);
        expect(JSON.stringify(vi.mocked(track).mock.calls)).not.toContain(sentinel);
        expect(document.body.innerHTML).not.toContain(sentinel);
        const secretInputs: HTMLInputElement[] = Array.from(document.querySelectorAll('input')).filter(
            (input: HTMLInputElement): boolean => input.value === sentinel
        );
        expect(secretInputs).toEqual([]);
    });
});
