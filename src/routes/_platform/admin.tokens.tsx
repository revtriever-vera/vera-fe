import { createFileRoute } from '@tanstack/react-router';
import { TokensPage } from '@/features/admin/pages/tokens-page';

export const Route = createFileRoute('/_platform/admin/tokens')({
    component: TokensPage
});
