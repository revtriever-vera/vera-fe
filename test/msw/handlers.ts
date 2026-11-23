import { http, HttpResponse, type RequestHandler } from 'msw';
import { accountHandlers } from './handlers/account.handlers';
import { authHandlers } from './handlers/auth.handlers';
import { billingHandlers } from './handlers/billing.handlers';
import { integrationsHandlers } from './handlers/integrations.handlers';
import { membersHandlers } from './handlers/members.handlers';
import { onboardingHandlers } from './handlers/onboarding.handlers';
import { portfolioHandlers } from './handlers/portfolio.handlers';
import { spendingHandlers } from './handlers/spending.handlers';

export const handlers: RequestHandler[] = [
    http.get('*/health', () => HttpResponse.json({ status: 'ok' })),
    ...authHandlers,
    ...accountHandlers,
    ...membersHandlers,
    ...billingHandlers,
    ...integrationsHandlers,
    ...onboardingHandlers(),
    ...portfolioHandlers(),
    ...spendingHandlers()
];
