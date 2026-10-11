import { useState, type ReactElement } from 'react';
import { FlaskConical } from 'lucide-react';
import { useSampleData, type SampleDataControls } from '@/shared/lib/sample-data/sample-data-context';
import { Button } from './button';
import { ConfirmDialog } from './confirm-dialog';
import { type UiText, useUiText } from './ui-text';

function ClearConfirm({ onClose }: { readonly onClose: () => void }): ReactElement {
    const t: UiText = useUiText();
    const sample: SampleDataControls = useSampleData();

    return (
        <ConfirmDialog
            title={t.sampleConfirmTitle}
            description={t.sampleConfirmBody}
            confirmLabel={t.sampleClear}
            pending={sample.isLoading}
            onCancel={onClose}
            onConfirm={(): void => {
                void sample.clear().then(onClose);
            }}
        />
    );
}

export function SampleDataBanner(): ReactElement | null {
    const t: UiText = useUiText();
    const sample: SampleDataControls = useSampleData();
    const [confirming, setConfirming] = useState<boolean>(false);

    if (!sample.active) {
        return null;
    }
    return (
        <div
            role="status"
            className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-caution/30 bg-caution/10 px-page-x py-2.5 text-sm"
        >
            <span className="flex items-center gap-2 font-medium text-content">
                <FlaskConical className="size-4 shrink-0 text-caution" aria-hidden="true" />
                {t.sampleBannerText}
            </span>
            <Button
                variant="secondary"
                size="sm"
                onClick={(): void => {
                    setConfirming(true);
                }}
            >
                {t.sampleClear}
            </Button>
            {confirming && (
                <ClearConfirm
                    onClose={(): void => {
                        setConfirming(false);
                    }}
                />
            )}
        </div>
    );
}
