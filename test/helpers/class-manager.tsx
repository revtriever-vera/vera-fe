import { vi, type Mock } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ClassManagerDialog } from '@/features/portfolio/targets/components/class-manager-dialog';
import type { AssetClassView, HoldingsResponse } from '@/features/portfolio/types';
import { assetClass, defaultClasses, sampleHoldings } from '../fixtures/portfolio';
import { server } from '../msw/server';
import { renderWithProviders } from '../render';
import { installClassesApi, type ClassesApi } from './classes-api';

export interface Setup {
    readonly api: ClassesApi;
    readonly user: UserEvent;
    readonly onOpenChange: Mock;
}

export function setup(classes: readonly AssetClassView[] = defaultClasses().data, holdings: HoldingsResponse = sampleHoldings()): Setup {
    const api: ClassesApi = installClassesApi({ data: [...classes] });
    server.use(http.get('*/portfolio/holdings', () => HttpResponse.json(holdings)));
    const onOpenChange: Mock = vi.fn();
    renderWithProviders(<ClassManagerDialog open onOpenChange={onOpenChange} />);
    return { api, user: userEvent.setup(), onOpenChange };
}

export async function rowOf(name: string): Promise<HTMLElement> {
    const row: HTMLElement | null = (await screen.findByText(name)).closest('li');
    if (row === null) {
        throw new Error(`row ${name} not found`);
    }
    return row;
}

export function customClass(overrides: Partial<AssetClassView> = {}): AssetClassView {
    return assetClass({ id: 'class-previdencia', name: 'Previdência', colorKey: 'c9', ...overrides });
}
