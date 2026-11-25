import { vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { InvestmentImportModal } from '@/features/portfolio/imports/components/investment-import-modal';
import { mockInvestmentImportApi, type InvestmentImportApi, type InvestmentImportApiOptions } from './investment-import-api';
import { statementFile } from './node-multipart';
import { renderInRouter, type RenderedInRouter } from './render-in-router';

const XLSX_TYPE: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export interface InvestmentImportSetup extends RenderedInRouter {
    readonly user: UserEvent;
    readonly onClose: () => void;
    readonly api: InvestmentImportApi;
}

export function renderInvestmentImportModal(options: InvestmentImportApiOptions = {}): InvestmentImportSetup {
    const api: InvestmentImportApi = mockInvestmentImportApi(options);
    const onClose: () => void = vi.fn();
    const rendered: RenderedInRouter = renderInRouter(<InvestmentImportModal onClose={onClose} />, { path: '/portfolio/assets' });
    return { ...rendered, user: userEvent.setup(), onClose, api };
}

export async function chooseReport(user: UserEvent, name: string = 'negociacao.xlsx', type: string = XLSX_TYPE): Promise<void> {
    const input: HTMLElement = await screen.findByLabelText('Arquivo');
    await user.upload(input, statementFile('xlsx-bytes', name, type));
}
