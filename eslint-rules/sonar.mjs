import { builtinRules } from 'eslint/use-at-your-own-risk';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import testingLibrary from 'eslint-plugin-testing-library';
import { decorated } from './sonar-decorators.mjs';
import { SONAR_WAY_EXTERNAL, SONAR_WAY_MAIN, SONAR_WAY_TEST } from './sonar-way.mjs';

const EXTERNAL_PLUGINS = {
    unicorn: unicorn.rules,
    react: react.rules,
    'jsx-a11y': jsxA11y.rules,
    'testing-library': testingLibrary.rules
};

function externalRule(id) {
    if (id.startsWith('@typescript-eslint/')) {
        return tseslint.plugin.rules[id.slice('@typescript-eslint/'.length)];
    }
    const [plugin, name] = id.split('/');
    if (name === undefined) {
        return builtinRules.get(id);
    }
    return EXTERNAL_PLUGINS[plugin][name];
}

function declaredOptions(rule, ruleOptions) {
    const schema = Array.isArray(rule.meta.schema) ? rule.meta.schema : [];
    return ruleOptions.map((option, index) => {
        const properties = schema[index]?.properties;
        if (properties === undefined || typeof option !== 'object' || Array.isArray(option)) {
            return option;
        }
        return Object.fromEntries(Object.entries(option).filter(([field]) => field in properties));
    });
}

function merged(ids) {
    const parts = ids.map(externalRule);
    return {
        meta: { type: 'problem', schema: [], messages: Object.assign({}, ...parts.map((part) => part.meta.messages)) },
        create(context) {
            const listeners = {};
            for (const part of parts) {
                for (const [selector, handler] of Object.entries(part.create(context))) {
                    const previous = listeners[selector];
                    listeners[selector] =
                        previous === undefined
                            ? handler
                            : (...args) => {
                                  previous(...args);
                                  handler(...args);
                              };
                }
            }
            return listeners;
        }
    };
}

const rules = {};
const options = {};
for (const rule of Object.values(sonarjs.rules)) {
    rules[rule.meta.docs.url.match(/S\d+/)[0]] = rule;
}
for (const [key, definition] of Object.entries(SONAR_WAY_EXTERNAL)) {
    if (!Array.isArray(definition)) {
        rules[key] = merged(definition.merge);
        continue;
    }
    const [id, ...ruleOptions] = definition;
    const rule = externalRule(id);
    rules[key] = decorated(rule, key);
    options[key] = declaredOptions(rule, ruleOptions);
}

function activated(keys, enabled) {
    return Object.fromEntries(
        keys
            .filter((key) => rules[key] !== undefined && !enabled.has(externalIdOf(key)))
            .map((key) => [`sonar/${key}`, ['error', ...(options[key] ?? [])]])
    );
}

export const sonarRules = rules;

function externalIdOf(key) {
    const definition = SONAR_WAY_EXTERNAL[key];
    return Array.isArray(definition) ? definition[0] : undefined;
}

export function sonarConfigs({ sources, tests, enabled }) {
    return [
        { files: [...sources, ...tests], plugins: { sonar: { rules } } },
        { files: sources, ignores: tests, rules: activated(SONAR_WAY_MAIN, enabled) },
        { files: tests, rules: activated(SONAR_WAY_TEST, enabled) }
    ];
}
