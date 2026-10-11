import { createFileRoute, notFound } from '@tanstack/react-router';
import { UiGalleryPage } from '@/features/dev/pages/ui-gallery-page';

export const Route = createFileRoute('/_dev/ui')({
    beforeLoad: (): void => {
        if (!import.meta.env.DEV) {
            throw notFound();
        }
    },
    component: UiGalleryPage
});
