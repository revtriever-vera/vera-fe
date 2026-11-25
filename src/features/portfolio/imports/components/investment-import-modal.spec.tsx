import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { chooseReport, renderInvestmentImportModal, type InvestmentImportSetup } from '../../../../../test/helpers/investment-import-modal';
import { stubNodeMultipart } from '../../../../../test/helpers/node-multipart';
import {
    effectItem,
    importedTitle,
    investmentImportCreated,
    investmentPreview,
    previewLine,
    PETR4_ID,
    VALE3_ID
} from '../../../../../test/fixtures/investment-imports';
import { server } from '../../../../../test/msw/server';
import type { InvestmentPreview, PositionBalance } from '../types';

const EXISTING: PositionBalance = { quantity: '100', averagePrice: '32.1' };

function existingPositionPreview(): InvestmentPreview {
    return investmentPreview({
        operations: [previewLine({ lineId: 'line-1', quantity: '100', unitPrice: '30' })],
        effect: [effectItem({ existingPosition: true, before: EXISTING, after: { quantity: '200', averagePrice: '31.05' } })]
    });
}

beforeEach(async () => {
    await stubNodeMultipart();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

function confirmButton(): HTMLElement {
    return screen.getByRole('button', { name: 'Confirmar importação' });
}

describe('InvestmentImportModal: arquivo', () => {
    it('envia o relatório sem titular e mostra a tabela, as notas e o aviso de arquivo repetido', async () => {
        const preview: InvestmentPreview = investmentPreview({
            notes: [{ code: 'rows_ignored', count: 3 }],
            alreadyImportedAt: '2026-11-01T10:00:00.000Z'
        });
        const { user, api }: InvestmentImportSetup = renderInvestmentImportModal({ preview });

        expect(await screen.findByText('Relatório da B3 em Excel (.xlsx) ou CSV, até 10 MB.')).toBeInTheDocument();
        await chooseReport(user);

        expect(await screen.findByRole('heading', { name: 'Confira as operações' })).toBeInTheDocument();
        expect(screen.getByText('3 linhas do relatório não são operações e ficaram de fora.')).toBeInTheDocument();
        expect(
            screen.getByText('Esse mesmo arquivo já foi importado em 01/11/2026. As linhas repetidas ficam de fora.')
        ).toBeInTheDocument();
        expect(api.previews).toEqual([{ fileText: 'xlsx-bytes', fields: {} }]);
    });

    it('traduz o erro de formato não reconhecido', async () => {
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({ previewStatus: 422, previewType: 'format.not_recognized' });

        await chooseReport(user);

        expect(await screen.findByText(/Não reconhecemos esse relatório/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Confirmar importação' })).not.toBeInTheDocument();
    });

    it('relatório sem operações explica e não libera a confirmação', async () => {
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({
            preview: investmentPreview({ operations: [], effect: [] })
        });

        await chooseReport(user);

        expect(await screen.findByText('Não achamos operações para importar nesse relatório.')).toBeInTheDocument();
        expect(confirmButton()).toBeDisabled();
        expect(screen.getByText('Não há linhas para importar.')).toBeInTheDocument();
    });
});

describe('InvestmentImportModal: correção e efeito', () => {
    it('ativo com posição pede a escolha, recalcula o efeito com a correção e confirma', async () => {
        const { user, api }: InvestmentImportSetup = renderInvestmentImportModal({
            preview: existingPositionPreview(),
            created: investmentImportCreated({
                applied: 1,
                positions: [effectItem({ before: EXISTING, after: { quantity: '300', averagePrice: '30.7' } })]
            })
        });
        await chooseReport(user);
        await screen.findByRole('heading', { name: 'Efeito na carteira' });

        expect(screen.getByText('PETR4: 100 → 200.')).toBeInTheDocument();
        expect(confirmButton()).toBeDisabled();
        expect(screen.getByText('Escolha o que fazer com a posição de 1 ativo.')).toBeInTheDocument();

        const row: HTMLElement = screen.getByRole('group', { name: 'PETR4' });
        await user.clear(within(row).getByLabelText('Quantidade'));
        await user.type(within(row).getByLabelText('Quantidade'), '200');
        await user.click(screen.getByRole('radio', { name: 'Somar à posição' }));

        expect(await screen.findByText('PETR4: 100 → 300.')).toBeInTheDocument();
        expect(screen.getByText(/Preço médio R\$\s32,10 → R\$\s30,70\./)).toBeInTheDocument();
        expect(screen.getByText('Recalculado com as suas correções.')).toBeInTheDocument();
        await user.click(confirmButton());

        expect(await screen.findByText('1 operação em 1 ativo.')).toBeInTheDocument();
        expect(api.commits).toEqual([
            { previewId: 'preview-1', edits: [{ lineId: 'line-1', quantity: '200', positionMode: 'add' }], fixedIncome: [] }
        ]);
        expect(screen.getByText('PETR4: 100 → 300.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver ativos' })).toBeInTheDocument();
    });

    it('"Já está na posição" manda history_only e mantém a posição', async () => {
        const { user, api }: InvestmentImportSetup = renderInvestmentImportModal({ preview: existingPositionPreview() });
        await chooseReport(user);

        await user.click(await screen.findByRole('radio', { name: 'Já está na posição' }));

        expect(await screen.findByText('PETR4: continua em 100.')).toBeInTheDocument();
        await user.click(confirmButton());
        await screen.findByText('Importação concluída');
        expect(api.commits[0]).toMatchObject({ edits: [{ lineId: 'line-1', positionMode: 'history_only' }] });
    });

    it('número inválido destaca o campo e trava a confirmação', async () => {
        const { user }: InvestmentImportSetup = renderInvestmentImportModal();
        await chooseReport(user);

        await user.type(await screen.findByLabelText('Preço'), 'x');

        expect(screen.getByText('Use só números, com vírgula ou ponto.')).toBeInTheDocument();
        expect(confirmButton()).toBeDisabled();
        expect(screen.getByText('Corrija os números destacados.')).toBeInTheDocument();
    });

    it('deixar a linha de fora tira o efeito dela e não sobra nada para importar', async () => {
        const { user }: InvestmentImportSetup = renderInvestmentImportModal();
        await chooseReport(user);

        await user.click(await screen.findByRole('button', { name: 'Não importar esta linha' }));

        expect(screen.getByText('Esta linha não será importada.')).toBeInTheDocument();
        expect(confirmButton()).toBeDisabled();
        await user.click(screen.getByRole('button', { name: 'Importar esta linha' }));
        expect(confirmButton()).toBeEnabled();
    });

    it('proventos entram como histórico, sem campos editáveis, e as já importadas ficam resumidas', async () => {
        const preview: InvestmentPreview = investmentPreview({
            operations: [
                previewLine(),
                previewLine({ lineId: 'inc', kind: 'income', incomeKind: 'dividend', quantity: null, unitPrice: null, grossMinor: 4550 }),
                previewLine({ lineId: 'dup', status: 'duplicate', reason: 'duplicate' }),
                previewLine({ lineId: 'ign', status: 'ignored', reason: 'skipped', kind: null })
            ]
        });
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({ preview });
        await chooseReport(user);

        const income: HTMLElement = await screen.findByRole('list', { name: 'Proventos do relatório' });
        expect(within(income).getByText(/Dividendo/)).toBeInTheDocument();
        expect(within(income).getByText(/R\$\s45,50/)).toBeInTheDocument();
        expect(within(income).queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.getByText('2 linhas já importadas ou fora da importação')).toBeInTheDocument();
        expect(screen.getAllByRole('group')).toHaveLength(1);
    });
});

describe('InvestmentImportModal: linha bloqueada', () => {
    const blocked: InvestmentPreview = investmentPreview({
        operations: [previewLine({ lineId: 'bl', status: 'blocked', reason: 'asset_not_found', assetId: null, ticker: 'VALE' })],
        effect: []
    });

    it('"Ativo não encontrado" abre a busca do catálogo e libera a linha com o ativo escolhido', async () => {
        server.use(
            http.get('*/catalog/assets', () =>
                HttpResponse.json({
                    data: [
                        {
                            id: VALE3_ID,
                            symbol: 'VALE3',
                            name: 'Vale ON',
                            kind: 'stock',
                            quantityDecimals: 0,
                            suggestedClassKey: 'acoes_br'
                        }
                    ]
                })
            )
        );
        const { user, api }: InvestmentImportSetup = renderInvestmentImportModal({ preview: blocked, created: investmentImportCreated() });
        await chooseReport(user);

        expect(await screen.findByText(/Não achamos esse ativo no catálogo/)).toBeInTheDocument();
        expect(confirmButton()).toBeDisabled();
        expect(screen.getByText('1 linha precisa de correção ou de ficar de fora.')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Buscar ativo' }));
        await user.type(screen.getByRole('searchbox', { name: 'Buscar no catálogo' }), 'vale');
        await user.click(await screen.findByRole('button', { name: 'Usar VALE3' }));

        expect(screen.getByText('VALE3')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Trocar ativo' })).toBeInTheDocument();
        expect(await screen.findByText('VALE3: nova posição de 100.')).toBeInTheDocument();
        await user.click(confirmButton());
        await screen.findByText('Importação concluída');
        expect(api.commits[0]).toMatchObject({ edits: [{ lineId: 'bl', assetId: VALE3_ID }] });
    });

    it('a busca sem resultado avisa e deixa voltar', async () => {
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({ preview: blocked });
        await chooseReport(user);

        await user.click(await screen.findByRole('button', { name: 'Buscar ativo' }));
        await user.type(screen.getByRole('searchbox', { name: 'Buscar no catálogo' }), 'zzzz');

        expect(await screen.findByText('Nenhum ativo com esse código ou nome.')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Voltar' }));
        expect(screen.getByRole('button', { name: 'Buscar ativo' })).toBeInTheDocument();
    });

    it('venda maior que a posição libera com uma quantidade corrigida ou deixando a linha de fora', async () => {
        const sell: InvestmentPreview = investmentPreview({
            operations: [previewLine({ lineId: 'sl', kind: 'sell', status: 'blocked', reason: 'sell_exceeds_position', quantity: '500' })],
            effect: [effectItem({ existingPosition: true, before: EXISTING, after: null })]
        });
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({ preview: sell });
        await chooseReport(user);
        expect(await screen.findByText(/A venda é maior que a posição/)).toBeInTheDocument();
        expect(confirmButton()).toBeDisabled();

        await user.clear(screen.getByLabelText('Quantidade'));
        await user.type(screen.getByLabelText('Quantidade'), '40');
        await user.click(screen.getByRole('radio', { name: 'Somar à posição' }));

        expect(await screen.findByText('PETR4: 100 → 60.')).toBeInTheDocument();
        expect(confirmButton()).toBeEnabled();
    });
});

describe('InvestmentImportModal: confirmação', () => {
    it('mostra o erro de prévia expirada sem perder a tela', async () => {
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({ commitStatus: 410 });
        await chooseReport(user);

        await user.click(await screen.findByRole('button', { name: 'Confirmar importação' }));

        expect(await screen.findByText('A conferência expirou. Mande o relatório de novo.')).toBeInTheDocument();
        expect(confirmButton()).toBeEnabled();
    });

    it('Importar outro volta ao passo do arquivo', async () => {
        const { user }: InvestmentImportSetup = renderInvestmentImportModal();
        await chooseReport(user);
        await user.click(await screen.findByRole('button', { name: 'Confirmar importação' }));
        await screen.findByText('Importação concluída');

        await user.click(screen.getByRole('button', { name: 'Importar outro relatório' }));

        expect(await screen.findByLabelText('Relatório da B3')).toBeInTheDocument();
        expect(screen.queryByText('Importação concluída')).not.toBeInTheDocument();
    });
});

describe('InvestmentImportModal: renda fixa', () => {
    const withTitles: InvestmentPreview = investmentPreview({
        operations: [],
        effect: [],
        fixedIncome: [
            importedTitle(),
            importedTitle({ lineId: 'fi-2', product: 'LCI Banco Sem Taxa', status: 'needs_input', rateBps: null, maturityDate: null }),
            importedTitle({ lineId: 'fi-3', product: 'LCA Já Cadastrada', status: 'duplicate' })
        ]
    });

    it('mostra a proposta, exige decisão por título e manda confirmar, não importar e o duplicado fora', async () => {
        const { user, api }: InvestmentImportSetup = renderInvestmentImportModal({
            preview: withTitles,
            created: investmentImportCreated({ applied: 0, positions: [] })
        });
        await chooseReport(user);

        expect(await screen.findByText('Achamos: CDB Banco Exemplo, 112% do CDI, vence em 08/2029. Confirmar?')).toBeInTheDocument();
        expect(screen.getByText('LCA Já Cadastrada já está na sua carteira e não será importado de novo.')).toBeInTheDocument();
        expect(confirmButton()).toBeDisabled();
        expect(screen.getByText('Decida o que fazer com 2 títulos de renda fixa.')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Confirmar' }));
        expect(screen.getByText('Título confirmado.')).toBeInTheDocument();
        const form: HTMLElement = screen.getByRole('heading', { name: 'Corrigir LCI Banco Sem Taxa' }).parentElement as HTMLElement;
        await user.click(within(form).getByRole('button', { name: 'Não importar este título' }));
        expect(screen.getByText('Este título não será importado.')).toBeInTheDocument();
        await user.click(confirmButton());

        expect(await screen.findByText('1 título de renda fixa.')).toBeInTheDocument();
        expect(api.commits[0]).toMatchObject({
            fixedIncome: [
                { lineId: 'fi-1', confirm: true },
                { lineId: 'fi-2', skip: true }
            ]
        });
    });

    it('título sem taxa calculada abre o formulário já preenchido, com o que falta destacado', async () => {
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({ preview: withTitles });
        await chooseReport(user);

        const form: HTMLElement = (await screen.findByRole('heading', { name: 'Corrigir LCI Banco Sem Taxa' }))
            .parentElement as HTMLElement;

        expect(within(form).getByLabelText('Nome do título')).toHaveValue('LCI Banco Sem Taxa');
        expect(within(form).getByText('Informe a taxa.')).toBeInTheDocument();
        expect(within(form).getByText('Informe o vencimento.')).toBeInTheDocument();
    });

    it('Corrigir abre o formulário do título proposto e grava a correção', async () => {
        const preview: InvestmentPreview = investmentPreview({ operations: [], effect: [], fixedIncome: [importedTitle()] });
        const { user, api }: InvestmentImportSetup = renderInvestmentImportModal({ preview });
        await chooseReport(user);

        await user.click(await screen.findByRole('button', { name: 'Corrigir' }));
        const rate: HTMLElement = await screen.findByLabelText('Percentual do CDI');
        expect(rate).toHaveValue('112');
        await user.clear(rate);
        await user.type(rate, '115');
        await user.click(screen.getByRole('button', { name: 'Usar estes dados' }));

        expect(await screen.findByText('Título corrigido.')).toBeInTheDocument();
        await user.click(confirmButton());
        await screen.findByText('Importação concluída');
        expect(api.commits[0]).toMatchObject({
            fixedIncome: [
                {
                    lineId: 'fi-1',
                    edits: { kind: 'cdb', indexer: 'cdi_percent', rateBps: 11500, appliedMinor: 1000000, maturityDate: '2029-08-01' }
                }
            ]
        });
    });

    it('título de fora pode voltar a entrar', async () => {
        const preview: InvestmentPreview = investmentPreview({
            operations: [],
            effect: [],
            fixedIncome: [importedTitle({ reason: 'event', status: 'check' })]
        });
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({ preview });
        await chooseReport(user);

        expect(await screen.findByText(/Confira antes de confirmar: o título teve pagamento de juros ou amortização/)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Não importar este título' }));
        await user.click(screen.getByRole('button', { name: 'Importar este título' }));

        expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
        expect(confirmButton()).toBeDisabled();
    });
});

describe('InvestmentImportModal: efeito de ativo novo', () => {
    it('lista cada ativo com a quantidade e o preço médio', async () => {
        const preview: InvestmentPreview = investmentPreview({
            operations: [previewLine(), previewLine({ lineId: 'l2', ticker: 'VALE3', assetId: VALE3_ID, quantity: '10', unitPrice: '60' })],
            effect: [effectItem(), effectItem({ assetId: VALE3_ID, ticker: 'VALE3', after: { quantity: '10', averagePrice: '60' } })]
        });
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({ preview });
        await chooseReport(user);

        const effect: HTMLElement = await screen.findByRole('list', { name: 'Efeito por ativo' });
        expect(within(effect).getByText('PETR4: nova posição de 100.')).toBeInTheDocument();
        expect(within(effect).getByText('VALE3: nova posição de 10.')).toBeInTheDocument();
        expect(within(effect).getAllByText(/Preço médio R\$\s/)).toHaveLength(2);
        expect(PETR4_ID).toBeDefined();
    });
});
