import { http, HttpResponse } from 'msw';
import type { AssetTargetEntry, AssetTargetsInput, ClassDetail, ClassDetailAsset } from '@/features/portfolio/targets/types';
import { classDetail } from '../fixtures/class-detail';
import { server } from '../msw/server';
import { problem, type RecordedRequest } from './classes-api';

export interface ClassDetailApiOptions {
    readonly detail?: ClassDetail;
    readonly saveFailure?: { readonly type: string; readonly status: number };
    readonly missingClass?: boolean;
}

export interface ClassDetailApi {
    readonly requests: RecordedRequest[];
    readonly current: () => ClassDetail;
}

function withTargets(detail: ClassDetail, body: AssetTargetsInput): ClassDetail {
    const total: number = body.targets.reduce((sum: number, entry: AssetTargetEntry): number => sum + entry.targetInClassBps, 0);
    const equal: number = detail.assets.length === 0 ? 0 : Math.floor(10000 / detail.assets.length);
    return {
        ...detail,
        targetsSumBps: total,
        assets: detail.assets.map((asset: ClassDetailAsset): ClassDetailAsset => {
            const entry: AssetTargetEntry | undefined = body.targets.find((item: AssetTargetEntry): boolean => item.subjectId === asset.id);
            return { ...asset, targetInClassBps: total === 0 ? equal : (entry?.targetInClassBps ?? asset.targetInClassBps) };
        })
    };
}

export function installClassDetailApi(options: ClassDetailApiOptions = {}): ClassDetailApi {
    let detail: ClassDetail = options.detail ?? classDetail();
    const requests: RecordedRequest[] = [];
    server.use(
        http.get('*/portfolio/classes/:classId', () =>
            options.missingClass === true ? problem('allocation.class_not_found', 404) : HttpResponse.json(detail)
        ),
        http.put('*/allocation/targets/classes/:classId/assets', async ({ request }) => {
            const body: AssetTargetsInput = (await request.json()) as AssetTargetsInput;
            requests.push({ method: request.method, path: new URL(request.url).pathname, body });
            if (options.saveFailure !== undefined) {
                return problem(options.saveFailure.type, options.saveFailure.status);
            }
            detail = withTargets(detail, body);
            return HttpResponse.json({ classId: detail.class.classId, targets: body.targets });
        })
    );
    return { requests, current: (): ClassDetail => detail };
}
