import { http, HttpResponse, type RequestHandler } from 'msw';
import { loginSession, problem, sessionIdentity } from '../../fixtures/auth';

export const authHandlers: RequestHandler[] = [
    http.post('*/auth/refresh', (): Response => HttpResponse.json(problem('identity.invalid_refresh', 401), { status: 401 })),
    http.get('*/auth/me', (): Response => HttpResponse.json(problem('identity.unauthorized', 401), { status: 401 })),
    http.post('*/auth/logout', (): Response => new HttpResponse(null, { status: 204 })),
    http.post('*/auth/google', (): Response => HttpResponse.json(loginSession())),
    http.post('*/auth/facebook', (): Response => HttpResponse.json(loginSession()))
];

export function signedInHandlers(accessToken: string = 'access-token-1'): RequestHandler[] {
    return [
        http.post('*/auth/refresh', (): Response => HttpResponse.json({ outcome: 'authenticated', accessToken })),
        http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity()))
    ];
}
