import { http, HttpResponse, type RequestHandler } from 'msw';
import { closedState, onboardingState, onboardingSummary } from '../../fixtures/onboarding';

export function onboardingHandlers(): RequestHandler[] {
    return [
        http.get('*/onboarding', () => HttpResponse.json(closedState())),
        http.get('*/onboarding/summary', () => HttpResponse.json(onboardingSummary())),
        http.post('*/onboarding/start', () =>
            HttpResponse.json(onboardingState({ status: 'assets', startedAt: '2026-10-01T12:00:00.000Z' }))
        ),
        http.post('*/onboarding/steps/:step/complete', ({ params }) =>
            HttpResponse.json(
                onboardingState({
                    status: params['step'] === 'assets' ? 'banks' : 'summary',
                    steps: {
                        assets: { doneAt: params['step'] === 'assets' ? '2026-10-01T12:00:00.000Z' : null, skippedAt: null },
                        banks: { doneAt: params['step'] === 'banks' ? '2026-10-01T12:00:00.000Z' : null, skippedAt: null }
                    }
                })
            )
        ),
        http.post('*/onboarding/steps/:step/skip', ({ params }) =>
            HttpResponse.json(
                onboardingState({
                    status: params['step'] === 'assets' ? 'banks' : 'summary',
                    steps: {
                        assets: { doneAt: null, skippedAt: params['step'] === 'assets' ? '2026-10-01T12:00:00.000Z' : null },
                        banks: { doneAt: null, skippedAt: params['step'] === 'banks' ? '2026-10-01T12:00:00.000Z' : null }
                    }
                })
            )
        ),
        http.post('*/onboarding/dismiss', () => HttpResponse.json(closedState())),
        http.post('*/onboarding/finish', () =>
            HttpResponse.json(closedState({ dismissedAt: null, completedAt: '2026-10-01T12:00:00.000Z' }))
        ),
        http.post('*/onboarding/sample', () => HttpResponse.json(closedState({ sample: { active: true, available: true } }))),
        http.delete('*/onboarding/sample', () => HttpResponse.json(closedState({ sample: { active: false, available: true } })))
    ];
}

export interface SampleServer {
    readonly handlers: RequestHandler[];
    readonly calls: { readonly load: number; readonly clear: number };
    readonly isActive: () => boolean;
}

export function sampleServer(initial: { readonly active: boolean; readonly available: boolean }, loadGate?: Promise<void>): SampleServer {
    const sample: { active: boolean; available: boolean } = { ...initial };
    const calls: { load: number; clear: number } = { load: 0, clear: 0 };
    const current = (): Response => HttpResponse.json(closedState({ sample: { ...sample } }));
    return {
        calls,
        isActive: (): boolean => sample.active,
        handlers: [
            http.get('*/onboarding', current),
            http.post('*/onboarding/sample', async (): Promise<Response> => {
                await loadGate;
                calls.load += 1;
                sample.active = true;
                return current();
            }),
            http.delete('*/onboarding/sample', (): Response => {
                calls.clear += 1;
                sample.active = false;
                return current();
            })
        ]
    };
}
