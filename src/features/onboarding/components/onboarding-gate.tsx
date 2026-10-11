import type { ReactElement, ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useOnboardingGate, type OnboardingGate as GateDecision } from '../lib/use-onboarding-gate';

export function OnboardingGate({ children }: { readonly children: ReactNode }): ReactElement {
    const gate: GateDecision = useOnboardingGate();
    if (gate.kind === 'loading') {
        return <div className="min-h-dvh bg-canvas" />;
    }
    if (gate.kind === 'redirect') {
        return <Navigate to={gate.to} replace />;
    }
    return <>{children}</>;
}
