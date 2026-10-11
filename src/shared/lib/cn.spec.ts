import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
    it('junta classes truthy e ignora falsy', () => {
        const showB: boolean = Boolean(0);
        expect(cn('a', showB && 'b', undefined, 'c')).toBe('a c');
    });

    it('resolves a tailwind conflict keeping the last class', () => {
        expect(cn('p-2', 'p-4')).toBe('p-4');
    });
});
