import type { ReactElement } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { GitMerge, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { ClassName } from '../../components/class-name';
import { ClassTile } from '../../components/class-tile';
import { toClassColorKey } from '../../lib/class-color';
import { formatTargetBps } from '../../lib/format-bps';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { AssetClassView } from '../../types';

export interface ClassManagerRowProps {
    readonly assetClass: AssetClassView;
    readonly holdingsCount: number;
    readonly onRename: () => void;
    readonly onMerge: () => void;
    readonly onDelete: () => void;
}

const ICON_BUTTON: string =
    'inline-flex size-8 items-center justify-center rounded-control text-content-muted transition-colors hover:bg-surface-muted hover:text-content disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
const MENU_ITEM: string =
    'flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-sm text-content outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[highlighted]:bg-surface-muted';

type BlockedKey = 'classes.actions.deleteBlockedHoldings' | 'classes.actions.deleteBlockedSystem';

function deleteBlockedKey(assetClass: AssetClassView, holdingsCount: number): BlockedKey | null {
    if (holdingsCount > 0) {
        return 'classes.actions.deleteBlockedHoldings';
    }
    return assetClass.systemKey === null ? null : 'classes.actions.deleteBlockedSystem';
}

function DesktopActions({ name, blockedText, blockedId, onRename, onMerge, onDelete }: ActionsProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <div className="hidden items-center gap-1 sm:flex">
            <button type="button" className={ICON_BUTTON} aria-label={t('classes.actions.rename', { name })} onClick={onRename}>
                <Pencil className="size-4" aria-hidden="true" />
            </button>
            <button type="button" className={ICON_BUTTON} aria-label={t('classes.actions.merge', { name })} onClick={onMerge}>
                <GitMerge className="size-4" aria-hidden="true" />
            </button>
            <button
                type="button"
                className={ICON_BUTTON}
                aria-label={t('classes.actions.delete', { name })}
                aria-describedby={blockedText === null ? undefined : blockedId}
                disabled={blockedText !== null}
                onClick={onDelete}
            >
                <Trash2 className="size-4" aria-hidden="true" />
            </button>
        </div>
    );
}

interface ActionsProps {
    readonly name: string;
    readonly blockedText: string | null;
    readonly blockedId: string;
    readonly onRename: () => void;
    readonly onMerge: () => void;
    readonly onDelete: () => void;
}

function MobileActions({ name, blockedText, onRename, onMerge, onDelete }: ActionsProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger className={`${ICON_BUTTON} sm:hidden`} aria-label={t('classes.actions.menu', { name })}>
                <MoreHorizontal className="size-4" aria-hidden="true" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={4}
                    className="z-[60] min-w-48 rounded-control border border-border bg-surface p-1 shadow-popover"
                >
                    <DropdownMenu.Item className={MENU_ITEM} onSelect={onRename}>
                        <Pencil className="size-4" aria-hidden="true" />
                        {t('classes.actions.rename', { name })}
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={MENU_ITEM} onSelect={onMerge}>
                        <GitMerge className="size-4" aria-hidden="true" />
                        {t('classes.actions.merge', { name })}
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={MENU_ITEM} disabled={blockedText !== null} onSelect={onDelete}>
                        <Trash2 className="size-4" aria-hidden="true" />
                        <span className="flex flex-col">
                            {t('classes.actions.delete', { name })}
                            {blockedText === null ? null : <span className="text-2xs text-content-muted">{blockedText}</span>}
                        </span>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export function ClassManagerRow({ assetClass, holdingsCount, onRename, onMerge, onDelete }: ClassManagerRowProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const locale: SupportedLocale = useLocale();
    const label: ClassLabel = useClassLabel();
    const name: string = label(assetClass.systemKey, assetClass.name);
    const blockedKey: BlockedKey | null = deleteBlockedKey(assetClass, holdingsCount);
    const blockedText: string | null = blockedKey === null ? null : t(blockedKey);
    const blockedId: string = `blocked-${assetClass.id}`;
    const actions: ActionsProps = { name, blockedText, blockedId, onRename, onMerge, onDelete };
    return (
        <li className="flex items-center gap-3 py-3">
            <ClassTile systemKey={assetClass.systemKey} colorKey={toClassColorKey(assetClass.colorKey)} />
            <div className="flex min-w-0 flex-1 flex-col">
                <ClassName systemKey={assetClass.systemKey} name={assetClass.name} className="truncate text-sm font-medium text-content" />
                <span className="flex flex-wrap gap-x-3 text-xs text-content-muted">
                    <span>{t('classes.holdingsCount', { count: holdingsCount })}</span>
                    <span>{t('classes.target', { value: formatTargetBps(assetClass.targetBps, locale) })}</span>
                </span>
                {blockedText === null ? null : (
                    <span id={blockedId} className="sr-only">
                        {blockedText}
                    </span>
                )}
            </div>
            <DesktopActions {...actions} />
            <MobileActions {...actions} />
        </li>
    );
}
