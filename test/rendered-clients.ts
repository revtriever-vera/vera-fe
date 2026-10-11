import type { QueryClient } from '@tanstack/react-query';

const activeClients: QueryClient[] = [];

export function registerRenderedClient(client: QueryClient): void {
    activeClients.push(client);
}

export async function disposeRenderedClients(): Promise<void> {
    const clients: QueryClient[] = activeClients.splice(0);
    await Promise.all(clients.map((client: QueryClient): Promise<void> => client.cancelQueries()));
    clients.forEach((client: QueryClient): void => {
        client.clear();
    });
}
