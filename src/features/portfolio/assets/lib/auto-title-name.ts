export function autoTitleName(kindLabel: string, issuerName: string | null): string {
    return issuerName === null ? '' : `${kindLabel} ${issuerName}`;
}
