import { http, HttpResponse } from 'msw';
import type { AssetClassView, ClassesResponse, CreateClassInput, MergeClassesBody, UpdateClassBody } from '@/features/portfolio/types';
import { defaultClasses } from '../fixtures/portfolio';
import { server } from '../msw/server';

export interface RecordedRequest {
    readonly method: string;
    readonly path: string;
    readonly body: unknown;
}

export interface ClassesApi {
    readonly requests: RecordedRequest[];
    readonly current: () => readonly AssetClassView[];
}

const CLASS_ID_PATTERN: RegExp = /\/allocation\/classes\/([^/]+)/;

function classIdOf(url: string): string {
    return CLASS_ID_PATTERN.exec(url)?.[1] ?? '';
}

export function problem(type: string, status: number): Response {
    return HttpResponse.json({ type, title: 'x', status, detail: 'technical detail', requestId: null }, { status });
}

export function installClassesApi(initial: ClassesResponse = defaultClasses()): ClassesApi {
    let classes: AssetClassView[] = [...initial.data];
    const requests: RecordedRequest[] = [];
    const record = async (request: Request): Promise<unknown> => {
        const body: unknown = request.method === 'DELETE' ? null : await request.clone().json();
        requests.push({ method: request.method, path: new URL(request.url).pathname, body });
        return body;
    };
    server.use(
        http.get('*/allocation/classes', () => HttpResponse.json({ data: classes })),
        http.post('*/allocation/classes/:id/merge', async ({ request }) => {
            const body: MergeClassesBody = (await record(request)) as MergeClassesBody;
            const source: AssetClassView | undefined = classes.find((item: AssetClassView): boolean => item.id === classIdOf(request.url));
            const destination: AssetClassView | undefined = classes.find((item: AssetClassView): boolean => item.id === body.intoClassId);
            if (source === undefined || destination === undefined) {
                return problem('allocation.class_not_found', 404);
            }
            const merged: AssetClassView = { ...destination, targetBps: destination.targetBps + source.targetBps };
            classes = classes
                .filter((item: AssetClassView): boolean => item.id !== source.id)
                .map((item: AssetClassView): AssetClassView => (item.id === merged.id ? merged : item));
            return HttpResponse.json(merged);
        }),
        http.post('*/allocation/classes', async ({ request }) => {
            const body: CreateClassInput = (await record(request)) as CreateClassInput;
            const created: AssetClassView = {
                id: `class-new-${String(classes.length + 1)}`,
                systemKey: null,
                aliasKeys: [],
                name: body.name,
                colorKey: body.colorKey ?? 'c1',
                targetBps: 0,
                sortOrder: classes.length + 1
            };
            classes = [...classes, created];
            return HttpResponse.json(created, { status: 201 });
        }),
        http.patch('*/allocation/classes/:id', async ({ request }) => {
            const body: UpdateClassBody = (await record(request)) as UpdateClassBody;
            const id: string = classIdOf(request.url);
            classes = classes.map((item: AssetClassView): AssetClassView => (item.id === id ? { ...item, ...body } : item));
            return HttpResponse.json(classes.find((item: AssetClassView): boolean => item.id === id));
        }),
        http.delete('*/allocation/classes/:id', async ({ request }) => {
            await record(request);
            const id: string = classIdOf(request.url);
            classes = classes.filter((item: AssetClassView): boolean => item.id !== id);
            return new HttpResponse(null, { status: 204 });
        })
    );
    return { requests, current: (): readonly AssetClassView[] => classes };
}
