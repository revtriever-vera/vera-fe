import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderRouterAt } from '../../../test/router';

describe('home route', () => {
    it('renders the empty home page without errors', async () => {
        renderRouterAt('/');
        expect(await screen.findByTestId('home')).toBeEmptyDOMElement();
    });
});
