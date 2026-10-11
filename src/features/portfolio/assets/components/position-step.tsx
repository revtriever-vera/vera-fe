import { Search } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useMemo, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useHoldings } from '../../api/use-holdings.query';
import type { AssetClassView, HoldingsResponse } from '../../types';
import { ASSET_TYPE_SPECS, typeColorKey, type AddAssetType } from '../lib/asset-types';
import { heldPositions } from '../lib/held-positions';
import type { AddAssetFlow } from '../lib/use-add-asset-flow';
import { usePositionForm, type PositionFormState } from '../lib/use-position-form';
import type { CatalogAsset, CatalogGroup } from '../types';
import { AssetSearch } from './asset-search';
import { DetailsFrame } from './details-frame';
import { ExistingPositionPanel } from './existing-position-panel';
import { PositionPreview } from './position-preview';

const FORM_ID: string = 'add-position-form';

export interface PositionStepProps {
    readonly type: Exclude<AddAssetType, 'fixed_income'>;
    readonly flow: AddAssetFlow;
    readonly classes: readonly AssetClassView[];
    readonly initialClassId: string | undefined;
    readonly onBack: () => void;
    readonly onClose: () => void;
}

function PickHint(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border p-8 text-center text-sm text-content-muted">
            <Search className="size-6" aria-hidden="true" />
            <p>{t('position.pickHint')}</p>
        </div>
    );
}

function RightColumn({
    flow,
    state,
    classes,
    onClose
}: {
    readonly flow: AddAssetFlow;
    readonly state: PositionFormState;
    readonly classes: readonly AssetClassView[];
    readonly onClose: () => void;
}): ReactElement {
    if (flow.picked === null) {
        return <PickHint />;
    }
    if (flow.existingPositionId !== null) {
        return <ExistingPositionPanel positionId={flow.existingPositionId} asset={flow.picked} onDone={onClose} />;
    }
    return (
        <PositionPreview
            asset={flow.picked}
            form={state.form}
            classes={classes}
            formId={FORM_ID}
            alertMessage={state.alertMessage}
            onSubmit={(): void => {
                void state.submit();
            }}
        />
    );
}

function useHeldPositions(): ReadonlyMap<string, string> {
    const holdings: UseQueryResult<HoldingsResponse> = useHoldings();
    return useMemo((): ReadonlyMap<string, string> => heldPositions(holdings.data?.data ?? []), [holdings.data]);
}

function pickHandler(state: PositionFormState, flow: AddAssetFlow, held: ReadonlyMap<string, string>): (asset: CatalogAsset) => void {
    return (asset: CatalogAsset): void => {
        state.select(asset);
        flow.pick(asset, held.get(asset.id) ?? null);
    };
}

export function PositionStep({ type, flow, classes, initialClassId, onBack, onClose }: PositionStepProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const held: ReadonlyMap<string, string> = useHeldPositions();
    const state: PositionFormState = usePositionForm({
        classes,
        initialClassId,
        type,
        asset: flow.picked,
        onSaved: onClose,
        onDuplicate: flow.editExisting
    });
    const group: CatalogGroup | null = ASSET_TYPE_SPECS[type].group;
    const pick: (asset: CatalogAsset) => void = pickHandler(state, flow, held);
    return (
        <DetailsFrame
            type={type}
            colorKey={typeColorKey(classes, type)}
            submit={flow.existingPositionId === null ? { formId: FORM_ID, disabled: !state.canSubmit, busy: state.busy } : null}
            onBack={onBack}
            onClose={onClose}
            left={
                group === null ? null : (
                    <AssetSearch
                        group={group}
                        typeName={t(`types.${type}.name`)}
                        query={flow.query}
                        onQueryChange={flow.setQuery}
                        pickedId={flow.picked?.id ?? null}
                        heldAssetIds={new Set<string>(held.keys())}
                        classes={classes}
                        onPick={pick}
                    />
                )
            }
            right={<RightColumn flow={flow} state={state} classes={classes} onClose={onClose} />}
        />
    );
}
