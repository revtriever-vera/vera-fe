import { vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import {
    CLIENT_ID,
    ITEM_ITAU,
    ITEM_NUBANK,
    installConnectionsApi,
    type ConnectionsApi,
    type ConnectionsApiOptions
} from './connections-api';
import { renderRouterAt } from '../router';

export interface OpenedConnections {
    readonly user: UserEvent;
    readonly api: ConnectionsApi;
}

export async function openConnectionsPage(options: ConnectionsApiOptions = {}, fakeTimers: boolean = false): Promise<OpenedConnections> {
    const api: ConnectionsApi = installConnectionsApi(options);
    const user: UserEvent = userEvent.setup(fakeTimers ? { advanceTimers: vi.advanceTimersByTime.bind(vi) } : {});
    renderRouterAt('/spending/connections', { signedIn: true });
    await screen.findByRole('region', { name: 'Suas credenciais' });
    return { user, api };
}

export async function fillConnectionsForm(user: UserEvent, secret: string, items: string = `${ITEM_NUBANK}, ${ITEM_ITAU}`): Promise<void> {
    await user.type(screen.getByLabelText('Client ID'), CLIENT_ID);
    await user.type(screen.getByLabelText('Client Secret'), secret);
    await user.click(screen.getByLabelText('Item IDs'));
    await user.paste(items);
}

export async function submitConnectionsForm(user: UserEvent, name: string = 'Testar e conectar'): Promise<void> {
    await user.click(screen.getByRole('button', { name }));
}
