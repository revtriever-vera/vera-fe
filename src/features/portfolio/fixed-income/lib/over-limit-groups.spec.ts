import { describe, expect, it } from 'vitest';
import { emptyFgc, fgcGroup } from '../../../../../test/fixtures/fixed-income';
import { overLimitGroups } from './over-limit-groups';

describe('overLimitGroups', () => {
    it('junta os grupos da conta com os dos titulares e descarta os dentro do limite', () => {
        const result = overLimitGroups({
            ...emptyFgc(),
            groups: [fgcGroup({ groupId: 'a' }), fgcGroup({ groupId: 'b', overMinor: 0 })],
            byHolder: [
                { holder: null, coveredMinor: 0, capShareBps: 0, groups: [fgcGroup({ groupId: 'c' })], outside: [] },
                { holder: { userId: 'u', name: 'Ana' }, coveredMinor: 0, capShareBps: 0, groups: [fgcGroup({ groupId: 'd' })], outside: [] }
            ]
        });

        expect(result.map((item) => [item.key, item.holderName])).toEqual([
            ['a', null],
            ['account-c', null],
            ['u-d', 'Ana']
        ]);
    });
});
