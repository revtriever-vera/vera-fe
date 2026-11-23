import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { BillingContext, type BillingState } from '@/shared/lib/billing/billing-context';
import { billingState } from '../../../../test/fixtures/billing';
import { useSettingsMode } from './use-settings-mode';

function modeFor(overrides: Partial<BillingState>): ReturnType<typeof useSettingsMode> {
    const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
        <BillingContext value={billingState(overrides)}>{children}</BillingContext>
    );
    return renderHook(() => useSettingsMode(), { wrapper }).result.current;
}

describe('useSettingsMode', () => {
    it('segue o modo da cobrança', () => {
        expect(modeFor({ mode: 'self_hosted' })).toEqual({ mode: 'self_hosted', ready: true });
        expect(modeFor({ mode: 'hosted' })).toEqual({ mode: 'hosted', ready: true });
    });

    it('só fica pronto depois que a cobrança carrega', () => {
        expect(modeFor({ isLoading: true }).ready).toBe(false);
    });
});
