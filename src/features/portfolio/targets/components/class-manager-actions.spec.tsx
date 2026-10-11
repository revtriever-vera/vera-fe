import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { http } from 'msw';
import { defaultClasses, emptyHoldings } from '../../../../../test/fixtures/portfolio';
import { problem } from '../../../../../test/helpers/classes-api';
import { customClass, rowOf, setup, type Setup } from '../../../../../test/helpers/class-manager';
import { server } from '../../../../../test/msw/server';
import type { AssetClassView } from '../../types';

function renamedFii(): AssetClassView[] {
    return defaultClasses().data.map((item: AssetClassView): AssetClassView =>
        item.systemKey === 'fii' ? { ...item, name: 'Imóveis' } : item
    );
}

describe('ClassManagerDialog: renomear', () => {
    it('renomeia FIIs e manda só o nome alterado', async () => {
        const { api, user }: Setup = setup();
        await user.click(within(await rowOf('FIIs')).getByRole('button', { name: 'Renomear FIIs' }));
        const input: HTMLElement = screen.getByRole('textbox', { name: 'Nome da classe' });
        expect(input).toHaveValue('FIIs');
        await user.clear(input);
        await user.type(input, 'Fundos imobiliários');
        await user.click(screen.getByRole('button', { name: 'Salvar' }));

        expect(await rowOf('Fundos imobiliários')).toBeInTheDocument();
        expect(api.requests).toEqual([{ method: 'PATCH', path: '/allocation/classes/class-fii', body: { name: 'Fundos imobiliários' } }]);
        expect(screen.getByText('Classe renomeada para Fundos imobiliários')).toBeInTheDocument();
    });

    it('não oferece restaurar o nome em classe padrão que ainda não foi renomeada', async () => {
        const { user }: Setup = setup();
        await user.click(within(await rowOf('FIIs')).getByRole('button', { name: 'Renomear FIIs' }));

        expect(screen.queryByRole('button', { name: 'Restaurar nome padrão' })).not.toBeInTheDocument();
    });

    it('restaura o nome padrão mandando name nulo', async () => {
        const { api, user }: Setup = setup(renamedFii());
        await user.click(within(await rowOf('Imóveis')).getByRole('button', { name: 'Renomear Imóveis' }));
        await user.click(screen.getByRole('button', { name: 'Restaurar nome padrão' }));

        expect(await rowOf('FIIs')).toBeInTheDocument();
        expect(api.requests).toEqual([{ method: 'PATCH', path: '/allocation/classes/class-fii', body: { name: null } }]);
        expect(screen.getByText('Nome padrão restaurado')).toBeInTheDocument();
    });

    it('troca só a cor sem tocar no nome padrão', async () => {
        const { api, user }: Setup = setup();
        await user.click(within(await rowOf('FIIs')).getByRole('button', { name: 'Renomear FIIs' }));
        await user.click(screen.getByRole('radio', { name: 'Cor 11' }));
        await user.click(screen.getByRole('button', { name: 'Salvar' }));

        expect(await screen.findByText('Classe FIIs atualizada')).toBeInTheDocument();
        expect(api.requests).toEqual([{ method: 'PATCH', path: '/allocation/classes/class-fii', body: { colorKey: 'c11' } }]);
    });

    it('fecha sem enviar quando nada mudou', async () => {
        const { api, user }: Setup = setup();
        await user.click(within(await rowOf('FIIs')).getByRole('button', { name: 'Renomear FIIs' }));
        await user.click(screen.getByRole('button', { name: 'Salvar' }));

        expect(await screen.findByRole('dialog', { name: 'Gerenciar classes' })).toBeInTheDocument();
        expect(api.requests).toHaveLength(0);
    });

    it('recusa renomear para o nome de outra classe sem enviar', async () => {
        const { api, user }: Setup = setup();
        await user.click(within(await rowOf('FIIs')).getByRole('button', { name: 'Renomear FIIs' }));
        const input: HTMLElement = screen.getByRole('textbox', { name: 'Nome da classe' });
        await user.clear(input);
        await user.type(input, 'reits');
        await user.click(screen.getByRole('button', { name: 'Salvar' }));

        expect(await screen.findByText('Já existe uma classe com esse nome.')).toBeInTheDocument();
        expect(api.requests).toHaveLength(0);
    });
});

describe('ClassManagerDialog: juntar', () => {
    it('confirma a junção de FIIs em REITs com os números reais', async () => {
        const { api, user }: Setup = setup();
        await user.click(within(await rowOf('FIIs')).getByRole('button', { name: 'Juntar FIIs em outra' }));
        await user.click(screen.getByRole('combobox'));
        expect(screen.queryByRole('option', { name: 'FIIs' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('option', { name: 'REITs' }));
        await user.click(screen.getByRole('button', { name: 'Continuar' }));

        expect(screen.getByRole('dialog', { name: 'Juntar FIIs em REITs?' })).toBeInTheDocument();
        expect(screen.getByText(/Os 2 ativos de FIIs passam para REITs/)).toHaveTextContent('7% + 8% = 15%');
        expect(screen.getByText(/Nada é vendido\./)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Juntar classes' }));

        expect(await screen.findByText('FIIs juntada em REITs')).toBeInTheDocument();
        expect(api.requests).toEqual([
            { method: 'POST', path: '/allocation/classes/class-fii/merge', body: { intoClassId: 'class-reits' } }
        ]);
        expect(within(await rowOf('REITs')).getByText('Meta 15%')).toBeInTheDocument();
        expect(screen.queryByText('FIIs')).not.toBeInTheDocument();
    });

    it('só habilita Continuar depois de escolher o destino', async () => {
        const { user }: Setup = setup();
        await user.click(within(await rowOf('FIIs')).getByRole('button', { name: 'Juntar FIIs em outra' }));

        expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    });

    it('cancelar a confirmação volta para a lista sem enviar', async () => {
        const { api, user }: Setup = setup();
        await user.click(within(await rowOf('Cripto')).getByRole('button', { name: 'Juntar Cripto em outra' }));
        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: 'REITs' }));
        await user.click(screen.getByRole('button', { name: 'Continuar' }));
        await user.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(await screen.findByRole('dialog', { name: 'Gerenciar classes' })).toBeInTheDocument();
        expect(api.requests).toHaveLength(0);
    });

    it('traduz o erro da API ao juntar', async () => {
        const { user }: Setup = setup();
        server.use(http.post('*/allocation/classes/:id/merge', () => problem('allocation.class_not_found', 404)));
        await user.click(within(await rowOf('Cripto')).getByRole('button', { name: 'Juntar Cripto em outra' }));
        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: 'REITs' }));
        await user.click(screen.getByRole('button', { name: 'Continuar' }));
        await user.click(screen.getByRole('button', { name: 'Juntar classes' }));

        expect(await screen.findByText('Não encontramos essa classe.')).toBeInTheDocument();
        expect(screen.getByText('Não foi possível juntar as classes')).toBeInTheDocument();
    });
});

describe('ClassManagerDialog: excluir', () => {
    it('desabilita Excluir em classe com ativos e explica', async () => {
        setup();
        const row: HTMLElement = await rowOf('FIIs');
        const button: HTMLElement = within(row).getByRole('button', { name: 'Excluir FIIs' });

        expect(button).toBeDisabled();
        expect(button).toHaveAccessibleDescription('Esta classe tem ativos. Junte em outra para esvaziá-la.');
    });

    it('desabilita Excluir em classe padrão vazia e orienta a juntar', async () => {
        setup(defaultClasses().data, emptyHoldings());
        const button: HTMLElement = within(await rowOf('Cripto')).getByRole('button', { name: 'Excluir Cripto' });

        expect(button).toBeDisabled();
        expect(button).toHaveAccessibleDescription('Esta é uma classe padrão e não pode ser excluída. Junte em outra.');
    });

    it('exclui a classe vazia depois de confirmar', async () => {
        const { api, user }: Setup = setup([...defaultClasses().data, customClass()]);
        await user.click(within(await rowOf('Previdência')).getByRole('button', { name: 'Excluir Previdência' }));
        expect(screen.getByRole('dialog', { name: 'Excluir a classe Previdência?' })).toHaveTextContent('Ela está vazia.');
        await user.click(screen.getByRole('button', { name: 'Excluir' }));

        expect(await screen.findByText('Classe Previdência excluída')).toBeInTheDocument();
        expect(api.requests).toEqual([{ method: 'DELETE', path: '/allocation/classes/class-previdencia', body: null }]);
        expect(screen.queryByText('Previdência')).not.toBeInTheDocument();
    });

    it('avisa na confirmação e depois que a soma das metas deixa de ser 100%', async () => {
        const lowered: AssetClassView[] = defaultClasses().data.map((item: AssetClassView): AssetClassView =>
            item.systemKey === 'rf_pos' ? { ...item, targetBps: 1500 } : item
        );
        const { user }: Setup = setup([...lowered, customClass({ targetBps: 500 })]);
        await user.click(within(await rowOf('Previdência')).getByRole('button', { name: 'Excluir Previdência' }));
        expect(screen.getByText('Ela está vazia, mas tem meta de 5%. A soma das metas deixará de ser 100%.')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Excluir' }));

        expect(await screen.findByText('A soma das metas deixou de ser 100%. Ajuste na carteira-alvo.')).toBeInTheDocument();
    });

    it('orienta a juntar quando a classe recebeu ativos em outra aba', async () => {
        const { user }: Setup = setup([...defaultClasses().data, customClass()]);
        server.use(http.delete('*/allocation/classes/:id', () => problem('allocation.class_not_empty', 409)));
        await user.click(within(await rowOf('Previdência')).getByRole('button', { name: 'Excluir Previdência' }));
        await user.click(screen.getByRole('button', { name: 'Excluir' }));

        expect(await screen.findByText('Essa classe ainda tem ativos. Mova ou junte antes de excluir.')).toBeInTheDocument();
        expect(screen.getByText('Não foi possível excluir a classe')).toBeInTheDocument();
    });

    it('traduz a recusa de excluir classe padrão', async () => {
        const { user }: Setup = setup([...defaultClasses().data, customClass()]);
        server.use(http.delete('*/allocation/classes/:id', () => problem('allocation.system_class_not_deletable', 422)));
        await user.click(within(await rowOf('Previdência')).getByRole('button', { name: 'Excluir Previdência' }));
        await user.click(screen.getByRole('button', { name: 'Excluir' }));

        expect(await screen.findByText('Classes padrão não podem ser excluídas. Junte em outra.')).toBeInTheDocument();
    });
});
