import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { holderSearchSchema } from '@/features/portfolio/schemas/holder.schema';
import { ClassDetailPage } from '@/features/portfolio/targets/pages/class-detail-page';

const classSearchSchema = z.object({
    holder: holderSearchSchema
});

export const Route = createFileRoute('/_auth/_app/portfolio/classes/$classId')({
    validateSearch: classSearchSchema,
    component: ClassDetailPage
});
