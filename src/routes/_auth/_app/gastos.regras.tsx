import { createFileRoute } from '@tanstack/react-router';
import { RulesPage } from '@/features/spending/rules/pages/rules-page';

export const Route = createFileRoute('/_auth/_app/gastos/regras')({
    component: RulesPage
});
