import { ESLint, RuleTester } from 'eslint';
import { describe, expect, it } from 'vitest';
import { sonarRules } from './sonar.mjs';

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } }
});

tester.run('S6767 unused prop', sonarRules.S6767, {
    valid: [{ code: 'function Card({ title }) { return <h1>{title}</h1>; }\nCard.propTypes = {};' }],
    invalid: [
        {
            code: "import PropTypes from 'prop-types';\nfunction Card({ title }) { return <h1>{title}</h1>; }\nCard.propTypes = { title: PropTypes.string, unused: PropTypes.string };",
            errors: 1
        },
        {
            code: 'function Card(props: { title: string; unused: string }) { return <h1>{props.title}</h1>; }',
            languageOptions: { parser: (await import('typescript-eslint')).default.parser },
            errors: 1
        }
    ]
});

tester.run('S6819 role instead of tag', sonarRules.S6819, {
    valid: [{ code: 'const node = <button type="button">Salvar</button>;' }],
    invalid: [{ code: 'const node = <div role="button">Salvar</div>;', errors: 1 }]
});

describe('sonar way in eslint.config.mjs', () => {
    it('turns the main rules on as error (S6767 and S6819 as warn until the follow-up) for sources and the test rules for specs', async () => {
        const eslint = new ESLint({ cwd: process.cwd() });
        const source = await eslint.calculateConfigForFile('src/shared/ui/button.tsx');
        const spec = await eslint.calculateConfigForFile('src/shared/ui/button.spec.tsx');
        expect(source.rules['sonar/S6767']?.[0]).toBe(1);
        expect(source.rules['sonar/S6819']?.[0]).toBe(1);
        expect(source.rules['sonar/S3358']?.[0]).toBe(2);
        expect(source.rules['sonar/S9026']).toBeUndefined();
        expect(spec.rules['sonar/S9026']?.[0]).toBe(2);
        expect(spec.rules['sonar/S6767']).toBeUndefined();
    });
});
