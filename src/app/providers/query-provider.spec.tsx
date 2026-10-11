import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { QueryProvider } from './query-provider';
import { ApiError } from '@/shared/lib/api/api-error';

function Probe({ queryFn }: { readonly queryFn: () => Promise<string> }): ReactElement {
    const query: UseQueryResult<string> = useQuery({ queryKey: ['probe'], queryFn });
    if (query.isPending) {
        return <span>loading</span>;
    }
    if (query.isError) {
        return <span>error</span>;
    }
    return <span>{query.data}</span>;
}

describe('QueryProvider', () => {
    it('renders the children', () => {
        render(
            <QueryProvider>
                <span>content</span>
            </QueryProvider>
        );
        expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('does not retry an ApiError below 500', async () => {
        const queryFn: () => Promise<string> = vi
            .fn()
            .mockRejectedValue(new ApiError({ type: 'x', title: 'x', status: 400, detail: 'failed', requestId: null }));
        render(
            <QueryProvider>
                <Probe queryFn={queryFn} />
            </QueryProvider>
        );
        await waitFor(() => expect(screen.getByText('error')).toBeInTheDocument());
        expect(queryFn).toHaveBeenCalledTimes(1);
    });

    it('retries up to twice an error that is not an ApiError', async () => {
        const queryFn: () => Promise<string> = vi
            .fn()
            .mockRejectedValueOnce(new Error('network down'))
            .mockRejectedValueOnce(new Error('network down'))
            .mockResolvedValueOnce('ok');
        render(
            <QueryProvider>
                <Probe queryFn={queryFn} />
            </QueryProvider>
        );
        await waitFor(() => expect(screen.getByText('ok')).toBeInTheDocument());
        expect(queryFn).toHaveBeenCalledTimes(3);
    });
});
