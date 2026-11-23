import type { paths } from '@/shared/lib/api/schema';

export type AuditList = paths['/platform/audit']['get']['responses']['200']['content']['application/json'];
export type AuditEntry = AuditList['items'][number];
