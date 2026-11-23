import type { SupportAccessItem } from '@/features/account/types';

export function supportAccessItem(overrides: Partial<SupportAccessItem> = {}): SupportAccessItem {
    return {
        id: '44444444-4444-4444-8444-444444444444',
        at: '2026-11-20T15:30:00.000Z',
        operatorName: 'Marina Souza',
        reason: 'Cliente pediu ajuda com a assinatura',
        layers: ['summary'],
        ...overrides
    };
}
