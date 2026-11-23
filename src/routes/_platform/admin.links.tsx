import { createFileRoute } from '@tanstack/react-router';
import { LinksPage } from '@/features/admin/pages/links-page';

export const Route = createFileRoute('/_platform/admin/links')({
    component: LinksPage
});
