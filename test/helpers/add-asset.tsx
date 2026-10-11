import { vi, type Mock } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { AddAssetModal, type AddAssetModalProps } from '@/features/portfolio/assets/components/add-asset-modal';
import { renderWithProviders } from '../render';

export interface AddAssetSetup {
    readonly user: UserEvent;
    readonly onOpenChange: Mock;
}

export function renderAddAsset(props: Partial<AddAssetModalProps> = {}): AddAssetSetup {
    const onOpenChange: Mock = vi.fn();
    renderWithProviders(<AddAssetModal open onOpenChange={onOpenChange} {...props} />);
    return { user: userEvent.setup(), onOpenChange };
}

export async function chooseType(user: UserEvent, name: string): Promise<void> {
    const group: HTMLElement = await screen.findByRole('group', { name: 'Tipos de investimento' });
    await user.click(within(group).getByRole('button', { name: new RegExp(name) }));
}

export async function searchAsset(user: UserEvent, term: string, optionName: RegExp): Promise<HTMLElement> {
    const box: HTMLElement = await screen.findByRole('searchbox');
    await user.type(box, term);
    return screen.findByRole('option', { name: optionName });
}

export async function fillQuantity(user: UserEvent, quantity: string): Promise<void> {
    const field: HTMLElement = await screen.findByRole('textbox', { name: 'Quantidade' });
    await user.clear(field);
    await user.type(field, quantity);
}

export async function submitAdd(user: UserEvent): Promise<void> {
    await user.click(screen.getByRole('button', { name: 'Adicionar à carteira' }));
}
