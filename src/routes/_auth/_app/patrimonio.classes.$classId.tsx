import { createFileRoute } from '@tanstack/react-router';
import { ClassDetailPage } from '@/features/portfolio/targets/pages/class-detail-page';

export const Route = createFileRoute('/_auth/_app/patrimonio/classes/$classId')({
    component: ClassDetailPage
});
