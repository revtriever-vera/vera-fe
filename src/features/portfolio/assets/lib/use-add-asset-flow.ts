import { useState } from 'react';
import type { CatalogAsset } from '../types';
import type { AddAssetType } from './asset-types';

interface FlowState {
    readonly type: AddAssetType | null;
    readonly lastType: AddAssetType | null;
    readonly query: string;
    readonly picked: CatalogAsset | null;
    readonly existingPositionId: string | null;
}

export interface AddAssetFlow extends FlowState {
    readonly selectType: (type: AddAssetType) => void;
    readonly goBack: () => void;
    readonly setQuery: (query: string) => void;
    readonly pick: (asset: CatalogAsset, heldPositionId: string | null) => void;
    readonly editExisting: (positionId: string) => void;
}

function initialState(initialType: AddAssetType | undefined, lastType: AddAssetType | null = null): FlowState {
    return { type: initialType ?? null, lastType, query: '', picked: null, existingPositionId: null };
}

export function useAddAssetFlow(initialType?: AddAssetType): AddAssetFlow {
    const [state, setState] = useState<FlowState>(initialState(initialType));
    return {
        ...state,
        selectType: (type: AddAssetType): void => {
            setState(initialState(type));
        },
        goBack: (): void => {
            setState((current: FlowState): FlowState => initialState(undefined, current.type));
        },
        setQuery: (query: string): void => {
            setState((current: FlowState): FlowState => ({ ...current, query }));
        },
        pick: (asset: CatalogAsset, heldPositionId: string | null): void => {
            setState((current: FlowState): FlowState => ({ ...current, picked: asset, existingPositionId: heldPositionId }));
        },
        editExisting: (positionId: string): void => {
            setState((current: FlowState): FlowState => ({ ...current, existingPositionId: positionId }));
        }
    };
}
