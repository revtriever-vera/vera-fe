import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/features/admin/pages/coming-soon-page';

export const Route = createFileRoute('/_platform/admin/accounts')({
    component: ComingSoonPage
});
