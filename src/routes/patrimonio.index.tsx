import { createFileRoute } from '@tanstack/react-router';
import { OverviewPage } from '@/features/portfolio/overview/pages/overview-page';

export const Route = createFileRoute('/patrimonio/')({
    component: OverviewPage
});
