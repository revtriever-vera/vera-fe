import { describe, expect, it } from 'vitest';
import { classDetail } from '../../../../../test/fixtures/class-detail';
import type { AssetTargetsFormValues } from '../schemas/asset-targets.schema';
import type { ClassDetailAsset } from '../types';
import {
    canSaveAssetTargets,
    hasUnsavedAssetChanges,
    mergeAssetDrafts,
    sumAssetTargets,
    toAssetFormValues,
    toAssetTargetsBody,
    withAutomaticSplit,
    withEqualSplit
} from './asset-targets-form';

const ASSETS: readonly ClassDetailAsset[] = classDetail().assets;

describe('asset-targets-form', () => {
    it('monta o formulário a partir do detalhe, na ordem da API', () => {
        const form: AssetTargetsFormValues = toAssetFormValues(ASSETS);

        expect(form.targets.map((item) => [item.subjectId, item.targetBps])).toEqual([
            ['position-itub4', 3000],
            ['position-wege3', 4000],
            ['position-petr4', 3000]
        ]);
    });

    it('monta o corpo do PUT com todos os ativos e bps inteiros', () => {
        expect(toAssetTargetsBody(toAssetFormValues(ASSETS))).toEqual({
            targets: [
                { subjectType: 'position', subjectId: 'position-itub4', targetInClassBps: 3000 },
                { subjectType: 'position', subjectId: 'position-wege3', targetInClassBps: 4000 },
                { subjectType: 'position', subjectId: 'position-petr4', targetInClassBps: 3000 }
            ]
        });
    });

    it('usar divisão igual automática zera tudo', () => {
        const form: AssetTargetsFormValues = withAutomaticSplit(toAssetFormValues(ASSETS));

        expect(form.targets.map((item) => item.targetBps)).toEqual([0, 0, 0]);
        expect(sumAssetTargets(form)).toBe(0);
    });

    it('dividir igualmente preenche os pesos iguais', () => {
        expect(withEqualSplit(toAssetFormValues(ASSETS)).targets.map((item) => item.targetBps)).toEqual([3334, 3333, 3333]);
    });

    it('detecta alteração e ignora NaN na soma', () => {
        const form: AssetTargetsFormValues = toAssetFormValues(ASSETS);
        const edited: AssetTargetsFormValues = {
            targets: form.targets.map((item, index) => (index === 0 ? { ...item, targetBps: Number.NaN } : item))
        };

        expect(hasUnsavedAssetChanges(form, ASSETS)).toBe(false);
        expect(hasUnsavedAssetChanges(edited, ASSETS)).toBe(true);
        expect(sumAssetTargets(edited)).toBe(7000);
        expect(hasUnsavedAssetChanges({ targets: form.targets.slice(1) }, ASSETS)).toBe(true);
    });

    it('só permite salvar com soma válida e alteração, ou na primeira gravação da divisão igual', () => {
        const form: AssetTargetsFormValues = toAssetFormValues(ASSETS);
        const changed: AssetTargetsFormValues = {
            targets: form.targets.map((item, index) => ({ ...item, targetBps: [4000, 3000, 3000][index] ?? 0 }))
        };

        expect(canSaveAssetTargets(form, ASSETS, 10000, true)).toBe(false);
        expect(canSaveAssetTargets(changed, ASSETS, 10000, true)).toBe(true);
        expect(canSaveAssetTargets(changed, ASSETS, 10000, false)).toBe(false);
        expect(canSaveAssetTargets(form, ASSETS, 0, true)).toBe(true);
        expect(canSaveAssetTargets(withAutomaticSplit(form), ASSETS, 0, true)).toBe(true);
    });

    it('mescla rascunhos: mantém o que o servidor não mexeu e adota o que mudou', () => {
        const next: readonly ClassDetailAsset[] = classDetail({
            seeds: [
                { id: 'position-itub4', symbol: 'ITUB4', name: 'x', valueMinor: 1, targetBps: 5000 },
                { id: 'position-wege3', symbol: 'WEGE3', name: 'x', valueMinor: 1, targetBps: 4000 },
                { id: 'position-new', symbol: 'NEW', name: 'x', valueMinor: 0, targetBps: 1000 }
            ]
        }).assets;
        const draft: AssetTargetsFormValues = {
            targets: toAssetFormValues(ASSETS).targets.map((item) => ({ ...item, targetBps: item.targetBps + 100 }))
        };

        const merged: AssetTargetsFormValues = mergeAssetDrafts(draft, ASSETS, next);

        expect(merged.targets.map((item) => [item.subjectId, item.targetBps])).toEqual([
            ['position-itub4', 5000],
            ['position-wege3', 4100],
            ['position-new', 1000]
        ]);
    });
});
