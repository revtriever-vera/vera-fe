import { http, HttpResponse, type RequestHandler } from 'msw';
import { closedState, onboardingState, onboardingSummary } from '../../fixtures/onboarding';

export function onboardingHandlers(): RequestHandler[] {
    return [
        http.get('*/onboarding', () => HttpResponse.json(closedState())),
        http.get('*/onboarding/summary', () => HttpResponse.json(onboardingSummary())),
        http.post('*/onboarding/start', () =>
            HttpResponse.json(onboardingState({ status: 'assets', startedAt: '2026-10-01T12:00:00.000Z' }))
        ),
        http.post('*/onboarding/dismiss', () => HttpResponse.json(closedState())),
        http.post('*/onboarding/finish', () =>
            HttpResponse.json(closedState({ dismissedAt: null, completedAt: '2026-10-01T12:00:00.000Z' }))
        ),
        http.post('*/onboarding/sample', () => HttpResponse.json(closedState({ sample: { active: true, available: true } })))
    ];
}
