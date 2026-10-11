import { vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { ImportCreated, ImportPreview } from '@/features/spending/types';
import { ImportStatementModal } from '@/features/spending/imports/components/import-statement-modal';
import { canonicalAccounts, importCreated, ofxPreview } from '../fixtures/spending';
import { server } from '../msw/server';
import { readImportForm, type ImportRequestForm } from './import-request';
import { statementFile } from './node-multipart';
import { renderInRouter, type RenderedInRouter } from './render-in-router';

export interface ImportApi {
    readonly previews: ImportRequestForm[];
    readonly commits: ImportRequestForm[];
}

export interface ImportApiOptions {
    readonly preview?: (form: ImportRequestForm) => ImportPreview;
    readonly created?: ImportCreated;
    readonly withAccounts?: boolean;
}

export interface ImportModalSetup extends RenderedInRouter {
    readonly user: UserEvent;
    readonly onClose: () => void;
    readonly api: ImportApi;
}

export function mockImportApi(options: ImportApiOptions = {}): ImportApi {
    const api: ImportApi = { previews: [], commits: [] };
    server.use(
        http.get('*/spending/accounts', () => HttpResponse.json(options.withAccounts === false ? { accounts: [] } : canonicalAccounts())),
        http.post('*/spending/imports/preview', async ({ request }) => {
            const form: ImportRequestForm = await readImportForm(request);
            api.previews.push(form);
            return HttpResponse.json(options.preview?.(form) ?? ofxPreview());
        }),
        http.post('*/spending/imports', async ({ request }) => {
            api.commits.push(await readImportForm(request));
            return HttpResponse.json(options.created ?? importCreated(), { status: 201 });
        })
    );
    return api;
}

export function renderImportModal(options: ImportApiOptions = {}): ImportModalSetup {
    const api: ImportApi = mockImportApi(options);
    const onClose: () => void = vi.fn();
    const rendered: RenderedInRouter = renderInRouter(<ImportStatementModal onClose={onClose} />, {
        path: '/spending/connections?import=true'
    });
    return { ...rendered, user: userEvent.setup(), onClose, api };
}

export async function chooseStatement(user: UserEvent, content: string = 'OFXHEADER:100', name: string = 'extrato.ofx'): Promise<void> {
    const input: HTMLElement = await screen.findByLabelText(/Arquivo do extrato|Statement file/);
    await user.upload(input, statementFile(content, name));
}

export function problem(type: string, status: number): Response {
    return HttpResponse.json({ type, title: 'x', status, detail: 'detail', requestId: null }, { status });
}
