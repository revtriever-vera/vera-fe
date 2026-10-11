import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { defaultClasses, sampleHoldings } from '../../../../../test/fixtures/portfolio';
import { installClassesApi, problem } from '../../../../../test/helpers/classes-api';
import { customClass, rowOf, setup, type Setup } from '../../../../../test/helpers/class-manager';
import { server } from '../../../../../test/msw/server';
import { renderWithProviders } from '../../../../../test/render';
import type { AssetClassView } from '../../types';
import { ClassManagerDialog } from './class-manager-dialog';

describe('ClassManagerDialog: lista', () => {
    it('não renderiza nada fechado', () => {
        renderWithProviders(<ClassManagerDialog open={false} onOpenChange={vi.fn()} />);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('lista as oito classes padrão com contagem, meta e ações rotuladas', async () => {
        setup();

        const brStocks: HTMLElement = await rowOf('Ações Brasil');
        expect(within(brStocks).getByText('3 ativos')).toBeInTheDocument();
        expect(within(brStocks).getByText('Meta 15%')).toBeInTheDocument();
        expect(within(brStocks).getByRole('button', { name: 'Renomear Ações Brasil' })).toBeInTheDocument();
        expect(within(brStocks).getByRole('button', { name: 'Juntar Ações Brasil em outra' })).toBeInTheDocument();
        expect(within(brStocks).getByRole('button', { name: 'Excluir Ações Brasil' })).toBeInTheDocument();
        const fii: HTMLElement = await rowOf('FIIs');
        expect(within(fii).getByText('2 ativos')).toBeInTheDocument();
        expect(within(fii).getByText('Meta 7%')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(8);
    });

    it('mostra o estado de carregamento e o erro com nova tentativa', async () => {
        server.use(http.get('*/allocation/classes', () => problem('internal', 500)));
        server.use(http.get('*/portfolio/holdings', () => HttpResponse.json(sampleHoldings())));
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<ClassManagerDialog open onOpenChange={vi.fn()} />);

        expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Carregando classes');
        expect(await screen.findByText('Não foi possível carregar as classes.', {}, { timeout: 5000 })).toBeInTheDocument();
        installClassesApi();
        await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));

        expect(await screen.findByText('Ações Brasil')).toBeInTheDocument();
    });

    it('avisa quando a soma das metas não é 100% e fecha para ajustar', async () => {
        const { onOpenChange, user }: Setup = setup([...defaultClasses().data, customClass({ targetBps: 500 })]);

        expect(await screen.findByText('A soma das metas deixou de ser 100%. Ajuste na carteira-alvo.')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Fechar e ajustar metas' }));

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('não avisa quando as metas somam 100%', async () => {
        setup();
        await screen.findByText('Ações Brasil');

        expect(screen.queryByText(/deixou de ser 100%/)).not.toBeInTheDocument();
    });
});

describe('ClassManagerDialog: nova classe', () => {
    it('cria Previdência com a cor 9 e mostra a classe com meta 0%', async () => {
        const { api, user }: Setup = setup();
        await user.click(await screen.findByRole('button', { name: 'Nova classe' }));
        expect(screen.getByText('A nova classe começa com meta de 0%. Defina a meta na carteira-alvo.')).toBeInTheDocument();
        await user.type(screen.getByRole('textbox', { name: 'Nome da classe' }), 'Previdência');
        await user.click(screen.getByRole('radio', { name: 'Cor 9' }));
        await user.click(screen.getByRole('button', { name: 'Criar classe' }));

        const created: HTMLElement = await rowOf('Previdência');
        expect(within(created).getByText('Meta 0%')).toBeInTheDocument();
        expect(within(created).getByText('Nenhum ativo')).toBeInTheDocument();
        expect(api.requests).toEqual([{ method: 'POST', path: '/allocation/classes', body: { name: 'Previdência', colorKey: 'c9' } }]);
        expect(screen.getByText('Classe Previdência criada')).toBeInTheDocument();
    });

    it('sugere a próxima cor livre', async () => {
        const { user }: Setup = setup();
        await user.click(await screen.findByRole('button', { name: 'Nova classe' }));

        expect(screen.getByRole('radio', { name: 'Cor 9' })).toBeChecked();
    });

    it('mostra o erro no campo e não envia quando o nome repete (inclusive o padrão)', async () => {
        const { api, user }: Setup = setup();
        await user.click(await screen.findByRole('button', { name: 'Nova classe' }));
        await user.type(screen.getByRole('textbox', { name: 'Nome da classe' }), '  fiis ');
        await user.click(screen.getByRole('button', { name: 'Criar classe' }));

        expect(await screen.findByText('Já existe uma classe com esse nome.')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Nome da classe' })).toBeInvalid();
        expect(api.requests).toHaveLength(0);
    });

    it('mostra o erro no campo quando a API responde nome repetido', async () => {
        const { user }: Setup = setup();
        server.use(http.post('*/allocation/classes', () => problem('allocation.class_name_taken', 409)));
        await user.click(await screen.findByRole('button', { name: 'Nova classe' }));
        await user.type(screen.getByRole('textbox', { name: 'Nome da classe' }), 'Imóveis');
        await user.click(screen.getByRole('button', { name: 'Criar classe' }));

        expect(await screen.findByText('Já existe uma classe com esse nome.')).toBeInTheDocument();
    });

    it('traduz o limite de classes quando a API recusa', async () => {
        const { user }: Setup = setup();
        server.use(http.post('*/allocation/classes', () => problem('allocation.class_limit_reached', 422)));
        await user.click(await screen.findByRole('button', { name: 'Nova classe' }));
        await user.type(screen.getByRole('textbox', { name: 'Nome da classe' }), 'Imóveis');
        await user.click(screen.getByRole('button', { name: 'Criar classe' }));

        expect(await screen.findByText('Você chegou ao limite de classes.')).toBeInTheDocument();
        expect(screen.getByText('Não foi possível salvar a classe')).toBeInTheDocument();
    });

    it('desabilita Nova classe no limite de 30 e explica', async () => {
        const many: AssetClassView[] = Array.from({ length: 30 }, (_unused: unknown, index: number): AssetClassView =>
            customClass({ id: `class-${String(index)}`, name: `Classe ${String(index)}`, sortOrder: index })
        );
        setup(many);

        const button: HTMLElement = await screen.findByRole('button', { name: 'Nova classe' });
        expect(button).toBeDisabled();
        expect(button).toHaveAccessibleDescription('Você chegou ao limite de 30 classes.');
    });
});
