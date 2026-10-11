import { describe, expect, it } from 'vitest';
import { apiClient, unwrap, unwrapEmpty } from './client';
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
