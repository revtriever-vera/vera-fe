import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/features/admin/pages/coming-soon-page';

function LinksRoute(): ReactElement {
    return <ComingSoonPage section="links" />;
}

export const Route = createFileRoute('/_platform/admin/links')({
    component: LinksRoute
});
