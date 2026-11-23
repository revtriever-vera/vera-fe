import type { AuditEntry } from '@/features/admin/types';

export function auditEntry(overrides: Partial<AuditEntry> = {}): AuditEntry {
    return {
        id: '11111111-1111-4111-8111-111111111111',
        action: 'admin.login',
        operatorUserId: '22222222-2222-4222-8222-222222222222',
        targetCompanyId: null,
        meta: { provider: 'google' },
        createdAt: '2026-11-23T12:00:00.000Z',
        ...overrides
    };
}
