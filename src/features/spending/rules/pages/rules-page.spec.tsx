import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import { track } from '@/shared/lib/analytics';
import { sessionIdentity } from '../../../../../test/fixtures/auth';
import { categoryId } from '../../../../../test/fixtures/spending';
import { clearViewport, installRulesApi, problemBody, stubViewport, type RulesApi } from '../../../../../test/helpers/rules-api';
import { server } from '../../../../../test/msw/server';
import { renderRouterAt } from '../../../../../test/router';

const PATH: string = '/spending/rules';

async function openPage(
    wide: boolean = true,
    api: RulesApi = installRulesApi()
): Promise<{ user: UserEvent; api: RulesApi; router: AnyRouter }> {
    stubViewport(wide);
    const user: UserEvent = userEvent.setup();
    const router: AnyRouter = renderRouterAt(PATH, { signedIn: true });
    await screen.findByRole('heading', { name: 'Suas regras' });
    await screen.findByRole('button', { name: 'Renomear Mercado' });
    await waitFor(() => {
        expect(document.getElementById('rule-rule-maria') ?? screen.queryByText('Nenhuma regra ainda')).not.toBeNull();
    });
    return { user, api, router };
}

async function pickOption(user: UserEvent, trigger: string, option: string): Promise<void> {
    await user.click(screen.getByRole('button', { name: trigger }));
    await user.click(await screen.findByRole('option', { name: new RegExp(option) }));
}

afterEach(() => {
    clearViewport();
});

describe('RulesPage: regras', () => {
    it('lista a regra de destinatário sem nenhum documento, da mais recente para a mais antiga', async () => {
        await openPage();

        const table: HTMLElement = await screen.findByRole('table', { name: 'Regras de categorização' });
        const rows: HTMLElement[] = within(table).getAllByRole('row');

        expect(within(rows[1] as HTMLElement).getByText('Maria Souza')).toBeInTheDocument();
        expect(within(rows[1] as HTMLElement).getByText('destinatário')).toBeInTheDocument();
        expect(within(rows[2] as HTMLElement).getByText('contém padaria estrela')).toBeInTheDocument();
        expect(table.textContent).not.toMatch(/\d{3}\.\d{3}\.\d{3}|\d{11}/);
    });

    it('filtra pelo rótulo', async () => {
        const { user } = await openPage();

        await user.type(screen.getByRole('searchbox', { name: 'Buscar regra pelo nome' }), 'maria');

        expect(screen.getByText('Maria Souza')).toBeInTheDocument();
        expect(screen.queryByText('contém padaria estrela')).not.toBeInTheDocument();
        await user.clear(screen.getByRole('searchbox', { name: 'Buscar regra pelo nome' }));
        await user.type(screen.getByRole('searchbox', { name: 'Buscar regra pelo nome' }), 'zzz');
        expect(screen.getByText('Nenhuma regra com esse nome.')).toBeInTheDocument();
    });

    it('mostra o estado vazio com o link para as transações sem categoria', async () => {
        await openPage(true, installRulesApi({ rules: [] }));

        expect(await screen.findByText('Nenhuma regra ainda')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver transações sem categoria' })).toHaveAttribute(
            'href',
            expect.stringContaining('/spending/transactions')
        );
    });

    it('trocar a categoria da regra mostra o toast com a contagem', async () => {
        const { user, api } = await openPage();

        await pickOption(user, 'Categoria da regra Maria Souza', 'Mercado');

        expect(await screen.findByText('Regra atualizada: 12 transações recategorizadas')).toBeInTheDocument();
        expect(api.rulePatches).toEqual([{ id: 'rule-maria', body: { categoryId: categoryId('groceries') } }]);
    });

    it('excluir pede confirmação e mostra o toast com a contagem', async () => {
        const { user, api } = await openPage();

        await user.click(screen.getByRole('button', { name: 'Excluir a regra Maria Souza' }));
        expect(screen.getByText(/voltam para a categorização automática/)).toBeInTheDocument();
        expect(api.deletedRules).toEqual([]);
        await user.click(screen.getByRole('button', { name: 'Excluir regra' }));

        expect(await screen.findByText('Regra excluída: 4 transações voltaram para a categorização automática')).toBeInTheDocument();
        expect(api.deletedRules).toEqual(['rule-maria']);
        expect(track).toHaveBeenCalledWith('spending_rule_deleted');
    });
});

describe('RulesPage: nova regra', () => {
    async function fillRule(user: UserEvent, text: string): Promise<void> {
        await user.click(screen.getByRole('button', { name: 'Nova regra' }));
        await user.type(await screen.findByLabelText('Texto'), text);
    }

    it('chama a prévia uma vez depois do debounce e cria com applyToPast', async () => {
        const { user, api } = await openPage();

        await fillRule(user, 'padaria estrela');
        expect(await screen.findByText('O texto vira “PADARIA ESTRELA” e encontra 1 transação')).toBeInTheDocument();
        expect(api.previews).toEqual([{ matchType: 'contains', pattern: 'padaria estrela', appliesTo: 'out' }]);
        await pickOption(user, 'Categoria da regra', 'Compras');
        await user.click(screen.getByRole('button', { name: 'Criar regra' }));

        expect(await screen.findByText('Regra criada: 3 transações recategorizadas')).toBeInTheDocument();
        expect(api.createdRules).toEqual([
            { matchType: 'contains', pattern: 'padaria estrela', appliesTo: 'out', categoryId: categoryId('shopping'), applyToPast: true }
        ]);
        expect(track).toHaveBeenCalledWith('spending_rule_created', { matchType: 'contains' });
    });

    it('sem aplicar ao passado, o toast diz que vale para as próximas', async () => {
        const { user } = await openPage();

        await fillRule(user, 'padaria');
        await user.click(screen.getByRole('checkbox', { name: 'Aplicar também às transações que já existem' }));
        await pickOption(user, 'Categoria da regra', 'Compras');
        await user.click(screen.getByRole('button', { name: 'Criar regra' }));

        expect(await screen.findByText('Regra criada. Ela vale para as próximas transações.')).toBeInTheDocument();
    });

    it('não chama a prévia nem cria com o formulário inválido', async () => {
        const { user, api } = await openPage();

        await fillRule(user, 'a');
        await user.click(screen.getByRole('button', { name: 'Criar regra' }));

        expect(await screen.findByText('Use pelo menos 2 caracteres')).toBeInTheDocument();
        expect(screen.getByText('Escolha uma categoria')).toBeInTheDocument();
        expect(api.previews).toEqual([]);
        expect(api.createdRules).toEqual([]);
    });

    it('o 409 mostra "Ver regra" e rola até a linha certa', async () => {
        const scroll: Mock = vi.fn();
        Element.prototype.scrollIntoView = scroll;
        const { user } = await openPage();
        server.use(
            http.post('*/spending/rules', () =>
                HttpResponse.json(problemBody('categories.rule_conflict', 409, { ruleId: 'rule-padaria' }), { status: 409 })
            )
        );

        await fillRule(user, 'padaria estrela');
        await pickOption(user, 'Categoria da regra', 'Compras');
        await user.click(screen.getByRole('button', { name: 'Criar regra' }));
        expect(await screen.findByText('Já existe uma regra igual')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Ver regra' }));

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
        const target: HTMLElement = document.getElementById('rule-rule-padaria') as HTMLElement;
        expect(scroll.mock.contexts).toContain(target);
        expect(target.closest('tr')).toHaveClass('ring-accent');
    });

    it('o 422 invalid_rule aparece no campo de texto', async () => {
        const { user } = await openPage();
        server.use(http.post('*/spending/rules', () => HttpResponse.json(problemBody('categories.invalid_rule', 422), { status: 422 })));

        await fillRule(user, 'padaria');
        await pickOption(user, 'Categoria da regra', 'Compras');
        await user.click(screen.getByRole('button', { name: 'Criar regra' }));

        expect(await screen.findByText('Esse texto não vale como regra. Use letras ou números.')).toBeInTheDocument();
    });

    it('a prévia inválida marca o campo e o limite de regras avisa', async () => {
        const { user } = await openPage();
        server.use(
            http.post('*/spending/rules/preview', () => HttpResponse.json(problemBody('categories.invalid_rule', 422), { status: 422 })),
            http.post('*/spending/rules', () => HttpResponse.json(problemBody('categories.limit_reached', 422), { status: 422 }))
        );

        await fillRule(user, 'padaria');
        expect(await screen.findByText('Esse texto não vale como regra. Use letras ou números.')).toBeInTheDocument();
        await pickOption(user, 'Categoria da regra', 'Compras');
        await user.click(screen.getByRole('button', { name: 'Criar regra' }));

        expect(await screen.findByText('Você chegou ao limite de 500 regras.')).toBeInTheDocument();
    });

    it('os modais prendem o foco', async () => {
        const { user } = await openPage();

        await user.click(screen.getByRole('button', { name: 'Nova regra' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Nova regra' });
        for (let step: number = 0; step < 12; step += 1) {
            await user.tab();
            expect(dialog).toContainElement(document.activeElement as HTMLElement);
        }
    });
});

describe('RulesPage: categorias', () => {
    it('renomeia Mercado para Supermercado por teclado e restaura o nome', async () => {
        const { user, api } = await openPage();

        await user.click(screen.getByRole('button', { name: 'Renomear Mercado' }));
        const input: HTMLElement = screen.getByRole('textbox', { name: 'Nome da categoria Mercado' });
        await user.clear(input);
        await user.type(input, 'Supermercado{Enter}');

        expect(await screen.findByText('Categoria renomeada')).toBeInTheDocument();
        await user.click(await screen.findByRole('button', { name: 'Renomear Supermercado' }));
        await user.click(screen.getByRole('button', { name: 'Restaurar nome' }));

        expect(await screen.findByText('Nome padrão restaurado')).toBeInTheDocument();
        expect(api.categoryPatches.map((patch) => patch.body)).toEqual([{ name: 'Supermercado' }, { name: null }]);
    });

    it('Esc cancela a edição e o nome repetido aparece no campo', async () => {
        const { user } = await openPage();
        server.use(
            http.patch('*/spending/categories/:id', () => HttpResponse.json(problemBody('categories.name_taken', 409), { status: 409 }))
        );

        await user.click(screen.getByRole('button', { name: 'Renomear Mercado' }));
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('textbox', { name: 'Nome da categoria Mercado' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Renomear Mercado' }));
        await user.type(screen.getByRole('textbox', { name: 'Nome da categoria Mercado' }), 'x{Enter}');

        expect(await screen.findByText('Já existe uma categoria com esse nome.')).toBeInTheDocument();
    });

    it('nome vazio não é enviado', async () => {
        const { user, api } = await openPage();

        await user.click(screen.getByRole('button', { name: 'Renomear Mercado' }));
        await user.clear(screen.getByRole('textbox', { name: 'Nome da categoria Mercado' }));
        await user.click(screen.getByRole('button', { name: 'Salvar' }));

        expect(await screen.findByText('Informe um nome')).toBeInTheDocument();
        expect(api.categoryPatches).toEqual([]);
    });

    it('alternar Lazer para fixo chama o PATCH com texto e aria-pressed', async () => {
        const { user, api } = await openPage();

        const toggle: HTMLElement = screen.getByRole('button', { name: 'Natureza de Lazer: flexível' });
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
        await user.click(toggle);

        await waitFor(() => {
            expect(api.categoryPatches).toEqual([{ id: categoryId('leisure'), body: { flexibility: 'fixed' } }]);
        });
        expect(track).toHaveBeenCalledWith('spending_flexibility_changed', { flexibility: 'fixed' });
        expect(await screen.findByRole('button', { name: 'Natureza de Lazer: fixo' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('troca o ícone de uma categoria própria e não oferece a troca na padrão', async () => {
        const { user, api } = await openPage();

        expect(screen.queryByRole('button', { name: 'Trocar o ícone de Mercado' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Trocar o ícone de Pets' }));
        await user.click(await screen.findByRole('menuitem', { name: 'Avião' }));

        expect(await screen.findByText('Ícone atualizado')).toBeInTheDocument();
        expect(api.categoryPatches).toEqual([{ id: 'cat-pets', body: { icon: 'Plane' } }]);
    });

    it('cria a categoria Pets como gasto flexível com o ícone PawPrint', async () => {
        const { user, api } = await openPage(
            true,
            installRulesApi({ categories: installRulesApi().categories.filter((c) => c.id !== 'cat-pets') })
        );

        await user.click(screen.getByRole('button', { name: 'Nova categoria' }));
        await user.type(await screen.findByLabelText('Nome'), 'Pets');
        await user.click(screen.getByRole('button', { name: 'Ícone' }));
        await user.click(await screen.findByRole('menuitem', { name: 'Pata' }));
        await user.click(screen.getByRole('button', { name: 'Criar categoria' }));

        expect(await screen.findByText('Categoria criada')).toBeInTheDocument();
        expect(api.createdCategories).toEqual([{ name: 'Pets', kind: 'expense', flexibility: 'flexible', icon: 'PawPrint' }]);
        expect(track).toHaveBeenCalledWith('spending_category_created');
    });

    it('entrada não manda flexibilidade e o nome repetido ou o limite aparecem', async () => {
        const { user, api } = await openPage();

        await user.click(screen.getByRole('button', { name: 'Nova categoria' }));
        await user.type(await screen.findByLabelText('Nome'), 'Freela');
        await user.click(screen.getByRole('radio', { name: 'Entrada' }));
        expect(screen.queryByRole('radio', { name: 'Fixo' })).not.toBeInTheDocument();
        server.use(http.post('*/spending/categories', () => HttpResponse.json(problemBody('categories.name_taken', 409), { status: 409 })));
        await user.click(screen.getByRole('button', { name: 'Criar categoria' }));
        expect(await screen.findByText('Já existe uma categoria com esse nome.')).toBeInTheDocument();
        server.use(
            http.post('*/spending/categories', () => HttpResponse.json(problemBody('categories.limit_reached', 422), { status: 422 }))
        );
        await user.click(screen.getByRole('button', { name: 'Criar categoria' }));

        expect(await screen.findByText('Você chegou ao limite de 50 categorias próprias.')).toBeInTheDocument();
        expect(api.createdCategories).toEqual([]);
    });

    it('excluir Pets movendo para Compras manda moveTo e mostra a contagem', async () => {
        const { user, api } = await openPage();

        await user.click(screen.getByRole('button', { name: 'Excluir Pets' }));
        expect(screen.getByText('As regras que apontam para esta categoria serão excluídas.')).toBeInTheDocument();
        await pickOption(user, 'Destino das transações', 'Compras');
        await user.click(screen.getByRole('button', { name: 'Excluir categoria' }));

        expect(await screen.findByText('Categoria excluída: 7 transações recategorizadas')).toBeInTheDocument();
        expect(api.deletedCategories).toEqual([{ id: 'cat-pets', moveTo: categoryId('shopping') }]);
    });

    it('excluir deixando para a categorização automática não manda moveTo', async () => {
        const { user, api } = await openPage();

        await user.click(screen.getByRole('button', { name: 'Excluir Pets' }));
        await user.click(screen.getByRole('button', { name: 'Excluir categoria' }));

        await waitFor(() => {
            expect(api.deletedCategories).toEqual([{ id: 'cat-pets', moveTo: null }]);
        });
    });

    it('o destino só oferece categorias da mesma natureza', async () => {
        const { user } = await openPage();

        await user.click(screen.getByRole('button', { name: 'Excluir Pets' }));
        await user.click(screen.getByRole('button', { name: 'Destino das transações' }));

        expect(await screen.findByRole('option', { name: /Compras/ })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: /Renda/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('option', { name: /Pets/ })).not.toBeInTheDocument();
    });

    it('a categoria padrão tem Excluir desabilitado com o tooltip', async () => {
        const { user } = await openPage();

        const remove: HTMLElement = screen.getByRole('button', { name: 'Excluir Mercado' });
        expect(remove).toHaveAttribute('aria-disabled', 'true');
        await user.hover(remove);

        expect(await screen.findByRole('tooltip')).toHaveTextContent('Categorias padrão não podem ser excluídas; você pode renomear');
    });

    it('agrupa por natureza e anota as transferências', async () => {
        await openPage();

        expect(screen.getByRole('heading', { name: 'Gastos', level: 3 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Entradas', level: 3 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Transferências', level: 3 })).toBeInTheDocument();
        expect(screen.getByText('Não contam como gasto nem como renda')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver o README do dicionário' })).toHaveAttribute(
            'href',
            expect.stringContaining('github.com')
        );
    });
});

describe('RulesPage: alteração pendente', () => {
    it('navegar com a renomeação alterada pede confirmação', async () => {
        const { user, router } = await openPage();

        await user.click(screen.getByRole('button', { name: 'Renomear Mercado' }));
        await user.type(screen.getByRole('textbox', { name: 'Nome da categoria Mercado' }), ' novo');
        await user.click(within(screen.getByRole('navigation', { name: 'Seções dos gastos' })).getByRole('link', { name: 'Transações' }));

        expect(await screen.findByText('Sair sem salvar?')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe(PATH);
        await user.click(screen.getByRole('button', { name: 'Continuar editando' }));
        expect(router.state.location.pathname).toBe(PATH);
        await user.click(within(screen.getByRole('navigation', { name: 'Seções dos gastos' })).getByRole('link', { name: 'Transações' }));
        await user.click(await screen.findByRole('button', { name: 'Sair sem salvar' }));
        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/spending/transactions');
        });
    });

    it('a edição sem alterações navega sem perguntar e o modal digitado pergunta', async () => {
        const { user, router } = await openPage();

        await user.click(screen.getByRole('button', { name: 'Nova categoria' }));
        await user.type(await screen.findByLabelText('Nome'), 'Algo');
        await user.click(within(screen.getByRole('navigation', { name: 'Seções dos gastos' })).getByRole('link', { name: 'Conexões' }));

        expect(await screen.findByText('Sair sem salvar?')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe(PATH);
    });
});

describe('RulesPage: inglês e 390 px', () => {
    it('mostra cartões e textos em inglês', async () => {
        stubViewport(false);
        installRulesApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        server.use(http.get('*/auth/me', () => HttpResponse.json(sessionIdentity({ locale: 'en' }))));

        expect(await screen.findByRole('heading', { name: 'Your rules' })).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
        const list: HTMLElement = await screen.findByRole('list', { name: 'Categorization rules' });
        expect(within(list).getAllByRole('listitem')).toHaveLength(2);
        expect(within(list).getByText('payee')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Delete the rule Maria Souza' }));
        await user.click(screen.getByRole('button', { name: 'Delete rule' }));

        expect(await screen.findByText('Rule deleted: 4 transactions went back to automatic categorization')).toBeInTheDocument();
    });

    it('os cartões em 390 px trocam a categoria', async () => {
        const { user, api } = await openPage(false);

        await pickOption(user, 'Categoria da regra contém padaria estrela', 'Compras');

        expect(await screen.findByText('Regra atualizada: 12 transações recategorizadas')).toBeInTheDocument();
        expect(api.rulePatches[0]?.id).toBe('rule-padaria');
    });
});

describe('RulesPage: falhas', () => {
    it('mostra o erro de carregamento das regras e das categorias', async () => {
        stubViewport(true);
        server.use(
            http.get('*/spending/rules', () => HttpResponse.json(problemBody('core.internal', 500), { status: 500 })),
            http.get('*/spending/categories', () => HttpResponse.json(problemBody('core.internal', 500), { status: 500 }))
        );
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar as regras')).toBeInTheDocument();
        expect(await screen.findByText('Não foi possível carregar as categorias')).toBeInTheDocument();
    });

    it('as ações que falham mostram toast crítico', async () => {
        const { user } = await openPage();
        server.use(
            http.patch('*/spending/rules/:id', () => HttpResponse.json(problemBody('categories.rule_not_found', 404), { status: 404 })),
            http.delete('*/spending/rules/:id', () => HttpResponse.json(problemBody('categories.rule_not_found', 404), { status: 404 })),
            http.delete('*/spending/categories/:id', () =>
                HttpResponse.json(problemBody('categories.category_not_found', 404), { status: 404 })
            ),
            http.patch('*/spending/categories/:id', () =>
                HttpResponse.json(problemBody('categories.system_category_locked', 422), { status: 422 })
            )
        );

        await pickOption(user, 'Categoria da regra Maria Souza', 'Mercado');
        expect(await screen.findByText('Não foi possível atualizar a regra')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Excluir a regra Maria Souza' }));
        await user.click(screen.getByRole('button', { name: 'Excluir regra' }));
        expect(await screen.findByText('Não foi possível excluir a regra')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Excluir Pets' }));
        await user.click(screen.getByRole('button', { name: 'Excluir categoria' }));
        expect(await screen.findByText('Não foi possível excluir a categoria')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Trocar o ícone de Pets' }));
        await user.click(await screen.findByRole('menuitem', { name: 'Avião' }));
        expect(await screen.findByText('Não foi possível salvar a categoria')).toBeInTheDocument();
    });
});
