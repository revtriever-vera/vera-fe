import { createFileRoute } from '@tanstack/react-router';
import { PortfolioLayout } from '@/features/portfolio/pages/portfolio-layout';

export const Route = createFileRoute('/patrimonio')({
    component: PortfolioLayout
});
