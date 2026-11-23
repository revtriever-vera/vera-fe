const BLANK_PAGE: string = 'about:blank';

export async function openPaymentLink(load: () => Promise<string>): Promise<void> {
    const tab: Window | null = window.open(BLANK_PAGE, '_blank');
    if (tab !== null) {
        tab.opener = null;
    }
    try {
        const url: string = await load();
        if (tab === null) {
            window.location.assign(url);
            return;
        }
        tab.location.href = url;
    } catch (error) {
        tab?.close();
        throw error;
    }
}
