import { createFileRoute } from '@tanstack/react-router';
import { AuditPage } from '@/features/admin/pages/audit-page';

export const Route = createFileRoute('/_platform/admin/audit')({
    component: AuditPage
});
