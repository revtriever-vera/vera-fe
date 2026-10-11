import { http, HttpResponse, type RequestHandler } from 'msw';
import { sessionIdentity } from '../../fixtures/auth';

export const EXPORT_BODY: string = JSON.stringify({ format: 'vera-export/1', account: { user: { name: 'Maria Teste' } } });

export const accountHandlers: RequestHandler[] = [
    http.patch('*/auth/me/preferences', async ({ request }): Promise<Response> => {
        const body: { locale: 'pt-BR' | 'en' | null } = (await request.json()) as { locale: 'pt-BR' | 'en' | null };
        return HttpResponse.json(sessionIdentity({ locale: body.locale ?? 'pt-BR', preferredLocale: body.locale }));
    }),
    http.get(
        '*/account/export',
        (): Response =>
            new HttpResponse(EXPORT_BODY, {
                headers: {
                    'content-type': 'application/json',
                    'content-disposition': 'attachment; filename="vera-export-2026-10-11.json"'
                }
            })
    ),
    http.delete('*/account', (): Response => new HttpResponse(null, { status: 204 }))
];
