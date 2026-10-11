import type { ReactElement } from 'react';
import { Sparkles } from 'lucide-react';
import { useSampleData, type SampleDataControls } from '@/shared/lib/sample-data/sample-data-context';
import { Button } from './button';
import { type UiText, useUiText } from './ui-text';

export function SampleDataButton(): ReactElement | null {
    const t: UiText = useUiText();
    const sample: SampleDataControls = useSampleData();

    if (!sample.available || sample.active) {
        return null;
    }
    return (
        <Button
            variant="secondary"
            loading={sample.isLoading}
            onClick={(): void => {
                void sample.load();
            }}
        >
            <Sparkles className="size-4" aria-hidden="true" />
            {t.sampleExplore}
        </Button>
    );
}
