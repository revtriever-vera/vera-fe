import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import type { AssetClassView } from '../../types';
import type { ClassTargetsFormValues } from '../schemas/class-targets.schema';
import { assetClass, defaultClasses } from '../../../../../test/fixtures/portfolio';
import {
    hasUnsavedChanges,
    mergeDrafts,
    sortedClasses,
    sumReceivedBps,
    sumTargets,
    toFormValues,
    toSaveBody,
    totalChipState
} from './targets-form';

describe('totalChipState', () => {
    it.each([
        [10000, { kind: 'ok', diffBps: 0 }],
        [9800, { kind: 'missing', diffBps: 200 }],
        [10300, { kind: 'excess', diffBps: 300 }]
    ])('%i', (sum: number, expected: { kind: string; diffBps: number }) => {
        expect(totalChipState(sum)).toEqual(expected);
    });
});

describe('valores do formulário', () => {
    it('ordena por sortOrder e soma 100% na carteira padrão', () => {
        const values: ClassTargetsFormValues = toFormValues([...defaultClasses().data].reverse());

        expect(values.targets[0]?.classId).toBe('class-rf-pos');
        expect(sumTargets(values)).toBe(10000);
        expect(sortedClasses(defaultClasses().data)).toHaveLength(8);
    });

    it('ignora valores inválidos na soma', () => {
        expect(
            sumTargets({
                targets: [
                    { classId: 'a', targetBps: Number.NaN },
                    { classId: 'b', targetBps: 300 }
                ]
            })
        ).toBe(300);
    });

    it('detecta alteração em relação ao salvo', () => {
        const classes: readonly AssetClassView[] = defaultClasses().data;
        const values: ClassTargetsFormValues = toFormValues(classes);

        expect(hasUnsavedChanges(values, classes)).toBe(false);
        expect(hasUnsavedChanges({ targets: values.targets.map((item) => ({ ...item, targetBps: item.targetBps + 1 })) }, classes)).toBe(
            true
        );
        expect(hasUnsavedChanges({ targets: values.targets.slice(1) }, classes)).toBe(true);
        expect(hasUnsavedChanges({ targets: [{ classId: 'x', targetBps: Number.NaN }] }, [assetClass({ id: 'x', targetBps: 0 })])).toBe(
            true
        );
    });

    it('monta o corpo do PUT só com classId e targetBps', () => {
        expect(toSaveBody({ targets: [{ classId: 'a', targetBps: 100 }] })).toEqual({ targets: [{ classId: 'a', targetBps: 100 }] });
    });
});

describe('mergeDrafts', () => {
    it('mantém a edição das classes que o servidor não mexeu e adota o que mudou', () => {
        const before: AssetClassView[] = [
            assetClass({ id: 'a', targetBps: 5000, sortOrder: 1 }),
            assetClass({ id: 'b', targetBps: 5000, sortOrder: 2 })
        ];
        const after: AssetClassView[] = [
            assetClass({ id: 'a', targetBps: 5000, sortOrder: 1 }),
            assetClass({ id: 'b', targetBps: 4000, sortOrder: 2 }),
            assetClass({ id: 'c', targetBps: 1000, sortOrder: 3 })
        ];
        const current: ClassTargetsFormValues = {
            targets: [
                { classId: 'a', targetBps: 6000 },
                { classId: 'b', targetBps: 4000 }
            ]
        };

        expect(mergeDrafts(current, before, after).targets).toEqual([
            { classId: 'a', targetBps: 6000 },
            { classId: 'b', targetBps: 4000 },
            { classId: 'c', targetBps: 1000 }
        ]);
    });
});

describe('sumReceivedBps', () => {
    it('lê meta.sumBps do problema da API', () => {
        const error: ApiError = new ApiError({
            type: 'allocation.targets_must_sum_100',
            title: 'x',
            status: 422,
            detail: 'd',
            requestId: null,
            meta: { sumBps: 9900 }
        });

        expect(sumReceivedBps(error)).toBe(9900);
        expect(sumReceivedBps(new Error('x'))).toBeNull();
        expect(sumReceivedBps(null)).toBeNull();
    });
});
