import type { ReactElement, ReactNode } from 'react';
import type { SessionUser } from './session-context';
import { hasRole, useRole } from './use-role';

export interface RoleGateProps {
    readonly min: SessionUser['role'];
    readonly children: ReactNode;
    readonly fallback?: ReactNode;
}

export function RoleGate({ min, children, fallback = null }: RoleGateProps): ReactElement {
    const { role } = useRole();
    return <>{hasRole(role, min) ? children : fallback}</>;
}
