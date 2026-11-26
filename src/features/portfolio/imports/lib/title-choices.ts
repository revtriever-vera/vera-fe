import type { CreateTitleBody } from '../../assets/types';
import { TITLE_STATUS, type ImportedTitle, type TitleDecision } from '../schemas/imported-title.schema';

export type TitleChoice =
    { readonly type: 'confirm' } | { readonly type: 'edit'; readonly edits: CreateTitleBody } | { readonly type: 'skip' };

export type TitleChoices = Readonly<Record<string, TitleChoice>>;

export function needsDecision(title: ImportedTitle): boolean {
    return title.status !== TITLE_STATUS.duplicate;
}

export function pendingTitles(titles: readonly ImportedTitle[], choices: TitleChoices): ImportedTitle[] {
    return titles.filter((title: ImportedTitle): boolean => needsDecision(title) && choices[title.lineId] === undefined);
}

function decisionOf(lineId: string, choice: TitleChoice): TitleDecision {
    if (choice.type === 'confirm') {
        return { lineId, confirm: true };
    }
    return choice.type === 'edit' ? { lineId, edits: choice.edits } : { lineId, skip: true };
}

export function toDecisions(titles: readonly ImportedTitle[], choices: TitleChoices): TitleDecision[] {
    return titles.flatMap((title: ImportedTitle): TitleDecision[] => {
        const choice: TitleChoice | undefined = choices[title.lineId];
        return choice === undefined ? [] : [decisionOf(title.lineId, choice)];
    });
}

export function importedCount(titles: readonly ImportedTitle[], choices: TitleChoices): number {
    return titles.filter((title: ImportedTitle): boolean => {
        const choice: TitleChoice | undefined = choices[title.lineId];
        return choice !== undefined && choice.type !== 'skip';
    }).length;
}
