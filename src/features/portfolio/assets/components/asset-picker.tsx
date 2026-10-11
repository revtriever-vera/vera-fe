import { useState, type ReactElement } from 'react';
import type { AddAssetType } from '../lib/asset-types';
import { AddAssetModal } from './add-asset-modal';
import { AssetTypeCards } from './asset-type-cards';

export interface AssetPickerProps {
    readonly className?: string;
}

export function AssetPicker({ className }: AssetPickerProps): ReactElement {
    const [type, setType] = useState<AddAssetType | null>(null);
    return (
        <>
            <AssetTypeCards onSelect={setType} focusType={null} className={className} />
            <AddAssetModal
                open={type !== null}
                initialType={type ?? undefined}
                onOpenChange={(open: boolean): void => {
                    if (!open) {
                        setType(null);
                    }
                }}
            />
        </>
    );
}
