import { describe, expect, it } from 'vitest';
import { PLUGGY_HOSTS, PLUGGY_LINKS, type PluggyTarget } from './pluggy-links';

const TARGETS: readonly PluggyTarget[] = ['meu', 'dashboard', 'github'];

describe('pluggy-links', (): void => {
    it('keeps the host of each target inside its link', (): void => {
        for (const target of TARGETS) {
            expect(new URL(PLUGGY_LINKS[target]).host).toBe(PLUGGY_HOSTS[target]);
        }
    });

    it('serves every link over https', (): void => {
        for (const target of TARGETS) {
            expect(PLUGGY_LINKS[target].startsWith('https://')).toBe(true);
        }
    });

    it('points github to the Meu Pluggy repository', (): void => {
        expect(PLUGGY_LINKS.github).toBe('https://github.com/pluggyai/meu-pluggy');
    });
});
