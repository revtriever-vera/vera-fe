const API_LOGO_PREFIX: string = '/spending/institution-logos/';

export function institutionLogoSrc(logoPath: string | null, apiUrl: string): string | null {
    if (logoPath?.startsWith(API_LOGO_PREFIX) !== true) {
        return null;
    }
    const origin: string = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    return `${origin}${logoPath}`;
}
