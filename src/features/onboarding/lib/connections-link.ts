import { HOME_PATH } from '../types';

export function resolveConnectionsLink(destination: string): string | null {
    return destination === HOME_PATH ? null : destination;
}
