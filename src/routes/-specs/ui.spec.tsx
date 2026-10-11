import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderRouterAt } from '../../../test/router';

describe('rota de componentes', () => {
    it('mostra a galeria no ambiente de desenvolvimento', async () => {
        renderRouterAt('/ui');
        expect(await screen.findByTestId('ui-gallery')).toBeInTheDocument();
    });
});
