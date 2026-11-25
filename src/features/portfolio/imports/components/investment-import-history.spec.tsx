import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderInvestmentImportModal, type InvestmentImportSetup } from '../../../../../test/helpers/investment-import-modal';
import type { InvestmentImportList } from '../types';
import { investmentImportList, investmentImportView } from '../../../../../test/fixtures/investment-imports';

const LIST: InvestmentImportList = investmentImportList([
    investmentImportView(),
    investmentImportView({
        id: 'import-2',
        fileName: 'antiga.xlsx',
        status: 'undone',
        operations: 1,
        createdAt: '2026-10-01T10:00:00.000Z'
    })
]);

describe('histórico de importações', () => {
    it('mostra os títulos de renda fixa no lugar de 0 operação', async () => {
        renderInvestmentImportModal({
            list: investmentImportList([investmentImportView({ operations: 0, fixedIncomeTitles: 3 })])
        });

        const history: HTMLElement = await screen.findByRole('list', { name: 'Histórico de importações' });

        expect(within(history).getByText(/20\/11\/2026 · 3 títulos de renda fixa/)).toBeInTheDocument();
        expect(within(history).queryByText(/0 operação/)).not.toBeInTheDocument();
    });

    it('lista as importações com status e só deixa desfazer a concluída', async () => {
        renderInvestmentImportModal({ list: LIST });

        const history: HTMLElement = await screen.findByRole('list', { name: 'Histórico de importações' });

        expect(within(history).getByText('negociacao-2026.xlsx')).toBeInTheDocument();
        expect(within(history).getByText(/20\/11\/2026 · 12 operações/)).toBeInTheDocument();
        expect(within(history).getByText('Concluída')).toBeInTheDocument();
        expect(within(history).getByText('Desfeita')).toBeInTheDocument();
        expect(within(history).getAllByRole('button')).toHaveLength(1);
    });

    it('desfazer pede confirmação, avisa a consequência e chama a API', async () => {
        const { user, api }: InvestmentImportSetup = renderInvestmentImportModal({ list: LIST });

        await user.click(await screen.findByRole('button', { name: 'Desfazer a importação de negociacao-2026.xlsx' }));

        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Desfazer esta importação?' });
        expect(within(dialog).getByText('Desfazer esta importação?')).toBeInTheDocument();
        expect(within(dialog).getByText(/As 12 operações dessa importação saem do histórico/)).toBeInTheDocument();
        expect(api.undone).toEqual([]);

        await user.click(within(dialog).getByRole('button', { name: 'Desfazer importação' }));

        expect(await screen.findByText('Importação desfeita.')).toBeInTheDocument();
        expect(api.undone).toEqual(['import-1']);
    });

    it('desfazer bloqueado mostra o motivo em texto do produto', async () => {
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({ list: LIST, undoStatus: 409 });

        await user.click(await screen.findByRole('button', { name: 'Desfazer a importação de negociacao-2026.xlsx' }));
        await user.click(await screen.findByRole('button', { name: 'Desfazer importação' }));

        expect(await screen.findByText('Não conseguimos desfazer a importação')).toBeInTheDocument();
        expect(screen.getByText(/outra importação mexeu nos mesmos ativos/)).toBeInTheDocument();
    });

    it('sem importações, diz que ainda não há nenhuma', async () => {
        renderInvestmentImportModal();

        expect(await screen.findByText('Você ainda não importou nenhum relatório.')).toBeInTheDocument();
    });
});
