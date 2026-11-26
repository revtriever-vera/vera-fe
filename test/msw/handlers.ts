import { http, HttpResponse, type RequestHandler } from 'msw';
import { adminHandlers } from './handlers/admin.handlers';
import { accountHandlers } from './handlers/account.handlers';
import { assistantHandlers } from './handlers/assistant.handlers';
import { authHandlers } from './handlers/auth.handlers';
import { calendarHandlers } from './handlers/calendar.handlers';
import { billingHandlers } from './handlers/billing.handlers';
import { agendaHandlers } from './handlers/agenda.handlers';
import { changesHandlers } from './handlers/changes.handlers';
import { goalsHandlers } from './handlers/goals.handlers';
import { integrationsHandlers } from './handlers/integrations.handlers';
import { membersHandlers } from './handlers/members.handlers';
import { noticesHandlers } from './handlers/notices.handlers';
import { onboardingHandlers } from './handlers/onboarding.handlers';
import { portfolioHandlers } from './handlers/portfolio.handlers';
import { spendingHandlers } from './handlers/spending.handlers';
import { summariesHandlers } from './handlers/summaries.handlers';
import { whatsappHandlers } from './handlers/whatsapp.handlers';

export const handlers: RequestHandler[] = [
    http.get('*/health', () => HttpResponse.json({ status: 'ok' })),
    ...authHandlers,
    ...adminHandlers,
    ...accountHandlers,
    ...membersHandlers,
    ...noticesHandlers(),
    ...billingHandlers,
    ...summariesHandlers,
    ...assistantHandlers,
    ...integrationsHandlers,
    ...onboardingHandlers(),
    ...portfolioHandlers(),
    ...agendaHandlers(),
    ...changesHandlers(),
    ...goalsHandlers(),
    ...spendingHandlers(),
    ...whatsappHandlers,
    ...calendarHandlers
];
