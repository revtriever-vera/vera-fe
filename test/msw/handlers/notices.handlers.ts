import { http, HttpResponse, type RequestHandler } from 'msw';

export function noticesHandlers(): RequestHandler[] {
    const enabled: Record<string, boolean> = { goal_behind: true, recurring_due: false, recurring_week: true };
    return [
        http.get('*/notifications/preferences', () =>
            HttpResponse.json({ items: Object.entries(enabled).map(([type, on]: [string, boolean]) => ({ type, enabled: on })) })
        ),
        http.patch('*/notifications/preferences', async ({ request }) => {
            const body: { type: string; enabled: boolean } = (await request.json()) as { type: string; enabled: boolean };
            enabled[body.type] = body.enabled;
            return HttpResponse.json(body);
        }),
        http.post('*/notifications/unsubscribe/:token', () => HttpResponse.json({ type: 'recurring_week' }))
    ];
}
