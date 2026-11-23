import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/msw/server';
import { apiClient, setProblemListener, unwrap, unwrapEmpty } from './client';
import { ApiError } from './api-error';

describe('apiClient', () => {
    it('fetches /health and returns the body through unwrap', async () => {
        const body: { status: string } = unwrap<{ status: string }>(await apiClient.GET('/health'));
        expect(body.status).toBe('ok');
    });
});

describe('unwrap', () => {
    it('returns data when the response is ok and has no error', () => {
        const data: { status: string } = unwrap({ data: { status: 'ok' }, response: { ok: true, status: 200 } as Response });
        expect(data).toEqual({ status: 'ok' });
    });

    it('throws ApiError when the response is not ok', () => {
        expect(() => unwrap({ error: { detail: 'failed' }, response: { ok: false, status: 400 } as Response })).toThrow(ApiError);
    });
});

describe('unwrapEmpty', () => {
    it('does not throw when the response is ok', () => {
        expect(() => {
            unwrapEmpty({ response: { ok: true, status: 204 } as Response });
        }).not.toThrow();
    });

    it('throws ApiError when the response is not ok', () => {
        expect(() => {
            unwrapEmpty({ error: { detail: 'failed' }, response: { ok: false, status: 500 } as Response });
        }).toThrow(ApiError);
    });
});

describe('problem listener', () => {
    function problemHandler(status: number, type: string): ReturnType<typeof http.get> {
        return http.get('*/health', () => HttpResponse.json({ type, title: type, status, detail: 'x', requestId: null }, { status }));
    }

    it('reports the type of a 402 and of a 429', async () => {
        const seen: string[] = [];
        const stop: () => void = setProblemListener((type: string): void => {
            seen.push(type);
        });
        server.use(problemHandler(402, 'billing.premium_required'));
        await apiClient.GET('/health');
        server.use(problemHandler(429, 'usage.cap_reached'));
        await apiClient.GET('/health');
        stop();

        expect(seen).toEqual(['billing.premium_required', 'usage.cap_reached']);
    });

    it('ignores other statuses and bodies that are not json', async () => {
        const seen: string[] = [];
        const stop: () => void = setProblemListener((type: string): void => {
            seen.push(type);
        });
        server.use(problemHandler(400, 'validation_failed'));
        await apiClient.GET('/health');
        server.use(http.get('*/health', () => new HttpResponse('nope', { status: 429 })));
        await apiClient.GET('/health');
        stop();

        expect(seen).toEqual([]);
    });
});
