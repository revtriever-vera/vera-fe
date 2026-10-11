import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { track } from '@/shared/lib/analytics';
import { i18n } from '@/shared/lib/i18n';
import {
    CLIENT_ID,
    DISABLED_SECRET,
    INVALID_SECRET,
    ITEM_ITAU,
    ITEM_MISSING,
    ITEM_NUBANK,
    SECRET_SENTINEL,
    UNAVAILABLE_SECRET
} from '../../../../../test/helpers/connections-api';
import { openConnectionsPage, fillConnectionsForm, submitConnectionsForm } from '../../../../../test/helpers/open-connections';
import { problemBody } from '../../../../../test/helpers/rules-api';
import { server } from '../../../../../test/msw/server';

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    void i18n.changeLanguage('pt-BR');
    window.localStorage.clear();
});

describe('ConnectionsPage: primeiro uso', () => {
    it('abre o tutorial com 6 passos, os links certos e o formulário vazio', async () => {
        await openConnectionsPage();

        const steps: HTMLElement = await screen.findByRole('list', { name: '' }).catch(() => screen.getAllByRole('list')[0] as HTMLElement);
        expect(steps).toBeInTheDocument();
        expect(
            screen
                .getAllByRole('heading', { level: 3 })
                .filter((heading) => /^(Crie|Conecte|Autorize|Copie|Cole)/.test(heading.textContent ?? ''))
        ).toHaveLength(6);
        const meu: HTMLElement[] = screen.getAllByRole('link', { name: /meu\.pluggy\.ai/ });
        expect(meu[0]).toHaveAttribute('href', 'https://meu.pluggy.ai');
        expect(meu[0]).toHaveAttribute('target', '_blank');
        expect(meu[0]).toHaveAttribute('rel', 'noopener noreferrer');
        expect(screen.getAllByRole('link', { name: /dashboard\.pluggy\.ai/ })).toHaveLength(2);
        expect(screen.getByRole('link', { name: /github\.com/ })).toHaveAttribute('href', 'https://github.com/pluggyai/meu-pluggy');
        expect(screen.getByLabelText('Client ID')).toHaveValue('');
        expect(screen.getByLabelText('Client Secret')).toHaveValue('');
        expect(screen.getByLabelText('Item IDs')).toHaveValue('');
    });

    it('registra o clique nos links do tutorial', async () => {
        const { user } = await openConnectionsPage();

        await user.click(screen.getAllByRole('link', { name: /dashboard\.pluggy\.ai/ })[0] as HTMLElement);

        expect(track).toHaveBeenCalledWith('spending_pluggy_link_clicked', { target: 'dashboard' });
    });

    it('envia PUT e depois POST, mostra o resultado por banco e limpa o segredo', async () => {
        const { user, api } = await openConnectionsPage();

        await fillConnectionsForm(user, SECRET_SENTINEL, `${ITEM_NUBANK}, ${ITEM_ITAU}, ${ITEM_MISSING}`);
        await submitConnectionsForm(user);

        expect(await screen.findByText(/Conectado: Nubank/)).toBeInTheDocument();
        expect(screen.getByText(/Conectado: Itaú/)).toBeInTheDocument();
        expect(screen.getByText(/Não encontramos este Item ID/)).toBeInTheDocument();
        expect(api.saved).toEqual([{ clientId: CLIENT_ID, clientSecret: SECRET_SENTINEL }]);
        expect(api.added).toEqual([[ITEM_NUBANK, ITEM_ITAU, ITEM_MISSING]]);
        expect(track).toHaveBeenCalledWith('spending_credentials_saved');
        expect(track).toHaveBeenCalledWith('spending_items_added', { connected: 2, failed: 1 });
    });
});

describe('ConnectionsPage: acompanhamento da sincronização', () => {
    it('mostra as conexões sincronizando e depois ativas e atualizadas hoje', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const { user } = await openConnectionsPage({ settleOnGet: 4 }, true);

        await fillConnectionsForm(user, SECRET_SENTINEL);
        await submitConnectionsForm(user);

        expect(await screen.findAllByText('sincronizando…')).toHaveLength(2);
        await vi.advanceTimersByTimeAsync(9000);
        expect(await screen.findAllByText(/atualizado hoje/)).toHaveLength(2);
        expect(screen.getAllByText('ativo')).toHaveLength(2);
    });

    it('para de consultar depois de 2 minutos e avisa para voltar mais tarde', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const { user, api } = await openConnectionsPage({}, true);

        await fillConnectionsForm(user, SECRET_SENTINEL);
        await submitConnectionsForm(user);
        await screen.findAllByText('sincronizando…');
        await vi.advanceTimersByTimeAsync(130_000);

        expect(await screen.findByText('Ainda sincronizando, volte em alguns minutos.')).toBeInTheDocument();
        const stopped: number = api.gets;
        await vi.advanceTimersByTimeAsync(20_000);
        expect(api.gets).toBe(stopped);
    });
});

describe('ConnectionsPage: erros ao conectar', () => {
    it('mostra a recusa da credencial no campo do segredo, não envia itens e limpa o segredo', async () => {
        const { user, api } = await openConnectionsPage();

        await fillConnectionsForm(user, INVALID_SECRET);
        await submitConnectionsForm(user);

        expect(await screen.findByText(/A Pluggy recusou essas credenciais/)).toBeInTheDocument();
        expect(api.added).toEqual([]);
        expect(screen.getByLabelText('Client Secret')).toHaveValue('');
        expect(screen.getByLabelText('Client Secret')).toHaveAttribute('aria-invalid', 'true');
    });

    it('avisa quando a Pluggy não responde', async () => {
        const { user } = await openConnectionsPage();

        await fillConnectionsForm(user, UNAVAILABLE_SECRET);
        await submitConnectionsForm(user);

        expect(
            await screen.findByRole('alert', { name: '' }).catch(() => screen.getByText('A Pluggy não respondeu agora'))
        ).toBeInTheDocument();
        expect(screen.getByText('Nada foi perdido. Tente de novo em instantes.')).toBeInTheDocument();
    });

    it('explica que a integração não está disponível nesta instalação', async () => {
        const { user } = await openConnectionsPage();

        await fillConnectionsForm(user, DISABLED_SECRET);
        await submitConnectionsForm(user);

        expect(await screen.findByText('Integração ainda não disponível nesta instalação')).toBeInTheDocument();
    });

    it('mostra o toast padrão no 429', async () => {
        const { user } = await openConnectionsPage();
        server.use(
            http.put('*/spending/connections/credentials', () =>
                HttpResponse.json(problemBody('core.too_many_attempts', 429), { status: 429 })
            )
        );

        await fillConnectionsForm(user, SECRET_SENTINEL);
        await submitConnectionsForm(user);

        expect(await screen.findByText('Muitas tentativas seguidas. Espere um pouco e tente de novo.')).toBeInTheDocument();
    });

    it('valida os campos antes de enviar e põe o foco no primeiro erro', async () => {
        const { user, api } = await openConnectionsPage();

        await submitConnectionsForm(user);

        expect(await screen.findByText('O Client ID é um código no formato 3f9a1c2e-…')).toBeInTheDocument();
        expect(screen.getByText('Informe o Client Secret.')).toBeInTheDocument();
        expect(screen.getByText('Cole ao menos um Item ID.')).toBeInTheDocument();
        expect(api.saved).toEqual([]);
        await waitFor(() => {
            expect(screen.getByLabelText('Client ID')).toHaveFocus();
        });
    });
});

describe('ConnectionsPage: Item IDs', () => {
    it('mostra os chips, marca o que não é uuid e não aceita o segredo colado ali', async () => {
        const { user } = await openConnectionsPage();

        await user.click(screen.getByLabelText('Item IDs'));
        await user.paste(`${ITEM_NUBANK} ${ITEM_NUBANK} segredo-colado`);

        const chips: HTMLElement = screen.getByRole('list', { name: 'Item IDs reconhecidos' });
        expect(within(chips).getAllByRole('listitem')).toHaveLength(2);
        expect(within(chips).getByText('0000…a001')).toBeInTheDocument();
        expect(within(chips).getByText(/segr…lado/)).toBeInTheDocument();
        expect(within(chips).getByText(/formato inválido/)).toBeInTheDocument();
    });
});
