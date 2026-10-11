import type { ReactElement } from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { UiGalleryPage } from '@/features/dev/pages/ui-gallery-page';
import { PortfolioShowcase } from './-portfolio-showcase';

function UiRoute(): ReactElement {
    return (
        <UiGalleryPage>
            <PortfolioShowcase />
        </UiGalleryPage>
    );
}

export const Route = createFileRoute('/_dev/ui')({
    beforeLoad: (): void => {
        if (!import.meta.env.DEV) {
            throw notFound();
        }
    },
    component: UiRoute
});
