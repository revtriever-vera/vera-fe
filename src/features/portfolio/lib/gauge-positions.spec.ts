import { describe, expect, it } from 'vitest';
import { gaugePositions } from './gauge-positions';

describe('gaugePositions', () => {
    it('escala pelo maior valor com folga e mantém a proporção entre a barra e a marca', () => {
        expect(gaugePositions(4000, 3000)).toEqual({ fill: 80, mark: 60 });
    });

    it('usa uma escala mínima quando os dois valores são zero', () => {
        expect(gaugePositions(0, 0)).toEqual({ fill: 0, mark: 0 });
    });

    it('a marca fica dentro da barra mesmo com a meta acima do atual', () => {
        const { fill, mark } = gaugePositions(1000, 5000);
        expect(fill).toBeLessThan(mark);
        expect(mark).toBeLessThanOrEqual(100);
    });
});
