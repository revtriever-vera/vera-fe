import { HOME_PATH } from '../types';

const IMPORT_QUERY: string = '?import=true';

export function resolveConnectionsLink(destination: string): string | null {
    return destination === HOME_PATH ? null : destination;
}

export function resolveImportLink(connectionsLink: string | null): string | null {
    return connectionsLink === null ? null : `${connectionsLink}${IMPORT_QUERY}`;
}
