import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { i18n } from '@/shared/lib/i18n';
import { chooseStatement, renderImportModal, type ImportModalSetup } from '../../../../../test/helpers/import-modal';
import type { ImportRequestForm } from '../../../../../test/helpers/import-request';
import { stubNodeMultipart } from '../../../../../test/helpers/node-multipart';
import { genericCsvPreview, importCreated } from '../../../../../test/fixtures/spending';
import type { ImportPreview } from '../../types';

const APPLIED_SAMPLE: ImportPreview['sample'] = [
    { date: '2026-09-02', description: 'PIX RECEBIDO', amountMinor: 15000 },
    { date: '2026-09-03', description: 'PADARIA', amountMinor: -2350 }
];

function previewFor(form: ImportRequestForm): ImportPreview {
    const raw: string | undefined = form.fields['mapping'];
    if (raw === undefined) {
        return genericCsvPreview();
    }
    const inverted: boolean = (JSON.parse(raw) as { invertSign: boolean }).invertSign;
    return genericCsvPreview({
        sample: APPLIED_SAMPLE.map((row: ImportPreview['sample'][number]) => ({
            ...row,
            amountMinor: inverted ? -row.amountMinor : row.amountMinor
        })),
        periodStart: '2026-09-02',
        periodEnd: '2026-09-03'
    });
}

async function pickColumn(user: UserEvent, field: string, column: string): Promise<void> {
    await user.click(screen.getByRole('combobox', { name: field }));
    await user.click(await screen.findByRole('option', { name: column }));
}

async function sampleRow(description: string): Promise<HTMLElement> {
    const row: HTMLElement | null = (await screen.findByText(description)).closest('tr');
    if (row === null) {
        throw new Error('linha da amostra não encontrada');
    }
    return row;
}

async function mapColumns(user: UserEvent): Promise<void> {
    await pickColumn(user, 'Data', 'Data');
    await pickColumn(user, 'Descrição', 'Histórico');
    await pickColumn(user, 'Valor', 'Valor');
}

beforeEach(async () => {
    window.localStorage.clear();
    await stubNodeMultipart();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('ImportStatementModal: CSV genérico', () => {
    it('mostra o mapeamento com as colunas do cabeçalho e segura a importação', async () => {
        const { user }: ImportModalSetup = renderImportModal({ preview: previewFor });

        await chooseStatement(user, 'a;b', 'extrato-banco.csv');

        expect(await screen.findByRole('heading', { name: 'Como ler este CSV' })).toBeInTheDocument();
        expect(screen.getByText('3 linhas encontradas')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Importar 3 transações' })).toBeDisabled();
        await user.click(screen.getByRole('combobox', { name: 'Data' }));
        expect(await screen.findByRole('option', { name: 'Histórico' })).toBeInTheDocument();
    });

    it('mapeia, atualiza a prévia com o mapping e inverte o sinal', async () => {
        const { user, api }: ImportModalSetup = renderImportModal({ preview: previewFor });
        await chooseStatement(user, 'a;b', 'extrato-banco.csv');
        await screen.findByRole('heading', { name: 'Como ler este CSV' });

        await mapColumns(user);
        await user.click(screen.getByRole('button', { name: 'Atualizar prévia' }));

        expect(await sampleRow('PIX RECEBIDO')).toHaveTextContent(/\+R\$\s150,00$/);
        expect(await sampleRow('PADARIA')).toHaveTextContent(/−R\$\s23,50$/);
        expect(JSON.parse(api.previews[1]?.fields['mapping'] ?? '{}')).toEqual({
            hasHeader: true,
            dateColumn: 0,
            descriptionColumn: 1,
            amountColumn: 4,
            dateFormat: 'dd/MM/yyyy',
            decimalSeparator: ',',
            invertSign: false
        });
        expect(api.previews[1]?.fields['format']).toBe('csv_generic');
        expect(screen.getByRole('button', { name: 'Importar 3 transações' })).toBeEnabled();

        await user.click(screen.getByRole('checkbox', { name: /Inverter sinal/ }));
        await user.click(screen.getByRole('button', { name: 'Atualizar prévia' }));

        await waitFor(async () => {
            expect(await sampleRow('PIX RECEBIDO')).toHaveTextContent(/−R\$\s150,00$/);
        });
        expect(await sampleRow('PADARIA')).toHaveTextContent(/\+R\$\s23,50$/);
    });

    it('rejeita colunas repetidas e coluna não escolhida', async () => {
        const { user, api }: ImportModalSetup = renderImportModal({ preview: previewFor });
        await chooseStatement(user, 'a;b', 'extrato-banco.csv');
        await screen.findByRole('heading', { name: 'Como ler este CSV' });

        await pickColumn(user, 'Data', 'Data');
        await pickColumn(user, 'Descrição', 'Data');
        await user.click(screen.getByRole('button', { name: 'Atualizar prévia' }));

        expect(await screen.findByText('Esta coluna já está em uso em outro campo')).toBeInTheDocument();
        expect(screen.getAllByRole('alert').map((alert: HTMLElement): string | null => alert.textContent)).toContain('Escolha a coluna');
        expect(api.previews).toHaveLength(1);
    });

    it('débito e crédito separados vão como um par de colunas', async () => {
        const { user, api }: ImportModalSetup = renderImportModal({ preview: previewFor });
        await chooseStatement(user, 'a;b', 'extrato-banco.csv');
        await screen.findByRole('heading', { name: 'Como ler este CSV' });

        await user.click(screen.getByRole('radio', { name: 'Débito e crédito separados' }));
        await pickColumn(user, 'Data', 'Data');
        await pickColumn(user, 'Descrição', 'Histórico');
        await pickColumn(user, 'Débito', 'Débito');
        await pickColumn(user, 'Crédito', 'Crédito');
        await user.click(screen.getByRole('button', { name: 'Atualizar prévia' }));

        await screen.findByRole('button', { name: 'Importar 3 transações' });
        const mapping: Record<string, unknown> = JSON.parse(api.previews[1]?.fields['mapping'] ?? '{}') as Record<string, unknown>;
        expect(mapping).toMatchObject({ debitColumn: 2, creditColumn: 3 });
        expect(mapping).not.toHaveProperty('amountColumn');
    });

    it('importa com o mapping, guarda por nome e reaproveita na próxima vez', async () => {
        const { user, api }: ImportModalSetup = renderImportModal({ preview: previewFor, created: importCreated() });
        await chooseStatement(user, 'a;b', 'extrato-banco.csv');
        await screen.findByRole('heading', { name: 'Como ler este CSV' });
        await mapColumns(user);
        await user.click(screen.getByRole('button', { name: 'Atualizar prévia' }));
        await user.click(await screen.findByRole('radio', { name: 'Nova conta' }));
        await user.type(screen.getByRole('textbox', { name: 'Nome da conta' }), 'Conta X');

        await user.click(screen.getByRole('button', { name: 'Importar 3 transações' }));

        await screen.findByText('4 novas transações');
        expect(api.commits[0]?.fields['format']).toBe('csv_generic');
        expect(JSON.parse(api.commits[0]?.fields['mapping'] ?? '{}')).toMatchObject({ amountColumn: 4, descriptionColumn: 1 });
        await user.click(screen.getByRole('button', { name: 'Importar outro' }));

        await chooseStatement(user, 'a;b', 'extrato-banco.csv');

        await screen.findByRole('heading', { name: 'Como ler este CSV' });
        expect(screen.getByRole('combobox', { name: 'Valor' })).toHaveTextContent('Valor');
        expect(screen.getByRole('combobox', { name: 'Descrição' })).toHaveTextContent('Histórico');
    });
});

describe('ImportStatementModal: inglês', () => {
    it('traduz o passo do arquivo e a prévia', async () => {
        await i18n.changeLanguage('en');
        const { user }: ImportModalSetup = renderImportModal();

        expect(await screen.findByRole('dialog', { name: 'Import statement' })).toBeInTheDocument();
        await chooseStatement(user);

        expect(await screen.findByText('6 transactions · from 09/02 to 09/27')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Import 6 transactions' })).toBeInTheDocument();
        expect(screen.getByText('We suggest Nubank Cartão (ending 4321)')).toBeInTheDocument();
    });
});
