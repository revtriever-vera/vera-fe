import { createFileRoute } from '@tanstack/react-router';
import { ClassDetailPage } from '@/features/portfolio/targets/pages/class-detail-page';

export const Route = createFileRoute('/patrimonio/classes/$classId')({
    component: ClassDetailPage
});
