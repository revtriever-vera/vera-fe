import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LoginHero } from './login-hero';

const mocks: { env: Record<string, string> } = vi.hoisted(() => ({ env: { VITE_LOGIN_PHOTO_URL: '' } }));

vi.mock('@/shared/config/env', () => ({ env: mocks.env }));

describe('LoginHero', () => {
    beforeEach((): void => {
        mocks.env['VITE_LOGIN_PHOTO_URL'] = '';
    });

    it('shows the pink gradient and no image without a photo url', () => {
        const { container } = render(<LoginHero />);

        expect(container.querySelector('.login-photo-placeholder')).toBeInTheDocument();
        expect(container.querySelector('.login-photo-overlay')).toBeInTheDocument();
        expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('puts the configured photo over the gradient', () => {
        mocks.env['VITE_LOGIN_PHOTO_URL'] = 'https://example.test/foto.jpg';

        const { container } = render(<LoginHero />);

        expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.test/foto.jpg');
        expect(container.querySelector('.login-photo-placeholder')).toBeInTheDocument();
    });
});
