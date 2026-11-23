import { http, HttpResponse, type RequestHandler } from 'msw';
import { sessionIdentity } from '../../fixtures/auth';

export const EXPORT_BODY: string = 'PK-zip-de-teste';

export const accountHandlers: RequestHandler[] = [
    http.patch('*/auth/me/preferences', async ({ request }): Promise<Response> => {
        const body: { locale: 'pt-BR' | 'en' | null } = (await request.json()) as { locale: 'pt-BR' | 'en' | null };
        return HttpResponse.json(sessionIdentity({ locale: body.locale ?? 'pt-BR', preferredLocale: body.locale }));
    }),
    http.get(
        '*/account/export/spreadsheets',
        (): Response =>
            new HttpResponse(EXPORT_BODY, {
                headers: {
                    'content-type': 'application/zip',
                    'content-disposition': 'attachment; filename="vera-meus-dados-2026-10-11.zip"'
                }
            })
    ),
    http.get('*/account/support-access', (): Response => HttpResponse.json({ items: [] })),
    http.delete('*/account', (): Response => new HttpResponse(null, { status: 204 }))
];
