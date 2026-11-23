import { describe, expect, it } from 'vitest';
import { routeFileIgnorePatternFor } from './route-targets';

function ignored(target: string, file: string): boolean {
    const pattern: string | undefined = routeFileIgnorePatternFor(target);
    return pattern !== undefined && new RegExp(pattern).test(file);
}

describe('routeFileIgnorePatternFor', () => {
    it('the unified target ignores nothing', () => {
        expect(routeFileIgnorePatternFor('unified')).toBeUndefined();
    });

    it('the tenant target ignores the admin routes and the platform layout only', () => {
        expect(ignored('tenant', 'admin.audit.tsx')).toBe(true);
        expect(ignored('tenant', '_platform.tsx')).toBe(true);
        expect(ignored('tenant', 'login.tsx')).toBe(false);
        expect(ignored('tenant', 'spending.recurring.tsx')).toBe(false);
    });

    it('the admin target keeps only the admin routes and the root', () => {
        expect(ignored('admin', 'admin.audit.tsx')).toBe(false);
        expect(ignored('admin', '_platform.tsx')).toBe(false);
        expect(ignored('admin', '__root.tsx')).toBe(false);
        expect(ignored('admin', 'login.tsx')).toBe(true);
        expect(ignored('admin', '_auth.tsx')).toBe(true);
        expect(ignored('admin', 'portfolio.assets.tsx')).toBe(true);
    });
});
