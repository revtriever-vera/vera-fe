import { RegExpParser } from '@eslint-community/regexpp';

function intercept(rule, keep) {
    return {
        ...rule,
        create(context) {
            const filtered = Object.create(context, {
                report: {
                    value(descriptor) {
                        if (keep(context, descriptor)) {
                            context.report(descriptor);
                        }
                    }
                }
            });
            return rule.create(filtered);
        }
    };
}

function maxOf(context) {
    const [option] = context.options;
    if (typeof option === 'number') {
        return option;
    }
    return option?.max ?? 7;
}

function countsOverMax(context, descriptor) {
    const params = descriptor.node?.params ?? [];
    return params.filter((param) => param.type !== 'TSParameterProperty').length > maxOf(context);
}

function isArrayLike(checker, type) {
    const constrained = checker.getBaseConstraintOfType(type) ?? type;
    const parts = constrained.isUnion() ? constrained.types : [constrained];
    return parts.every((part) => checker.isArrayType(part));
}

function callsOnArrayWithWideCallback(context, descriptor) {
    const services = context.sourceCode.parserServices;
    const node = descriptor.node;
    if (node === undefined || services?.program === undefined) {
        return false;
    }
    const call = node.parent;
    if (call?.type !== 'CallExpression' || call.callee.type !== 'MemberExpression') {
        return false;
    }
    const checker = services.program.getTypeChecker();
    const typeOf = (esNode) => checker.getTypeAtLocation(services.esTreeNodeToTSNodeMap.get(esNode));
    if (!isArrayLike(checker, typeOf(call.callee.object))) {
        return false;
    }
    if (node.type !== 'Identifier' && node.type !== 'MemberExpression') {
        return true;
    }
    const signatures = typeOf(node).getCallSignatures();
    return signatures.length === 0 || Math.max(...signatures.map((signature) => signature.parameters.length)) > 1;
}

function importKindOf(sourceCode, name) {
    for (const node of sourceCode.ast.body) {
        if (node.type !== 'ImportDeclaration') {
            continue;
        }
        const specifier = node.specifiers.find((candidate) => candidate.local.name === name);
        if (specifier === undefined) {
            continue;
        }
        const imported = specifier.type === 'ImportSpecifier' ? (specifier.imported.name ?? String(specifier.imported.value)) : null;
        return specifier.type === 'ImportDefaultSpecifier' || imported === 'default' ? 'default' : 'named';
    }
    return null;
}

function usedBesidesExport(sourceCode, name) {
    return sourceCode.ast.body
        .filter((node) => node.type === 'ImportDeclaration')
        .flatMap((node) => sourceCode.getDeclaredVariables(node))
        .filter((variable) => variable.name === name)
        .some((variable) =>
            variable.references.some(
                (reference) => !['ExportSpecifier', 'ExportDefaultDeclaration'].includes(reference.identifier.parent.type)
            )
        );
}

function reportedNameOf(node) {
    if (node.type === 'ExportSpecifier') {
        return node.local.type === 'Identifier' ? node.local.name : String(node.local.value);
    }
    if (node.type === 'Identifier') {
        return node.name;
    }
    return node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'Identifier' ? node.declaration.name : undefined;
}

function reExportsAnImport(context, descriptor) {
    const node = descriptor.node;
    const sourceCode = context.sourceCode;
    if (node === undefined) {
        return true;
    }
    if (node.type === 'ExportNamedDeclaration' && node.declaration != null) {
        return (
            node.declaration.type === 'VariableDeclaration' &&
            node.declaration.declarations.some(
                (declarator) => declarator.init?.type === 'Identifier' && importKindOf(sourceCode, declarator.init.name) === 'named'
            )
        );
    }
    const name = reportedNameOf(node);
    if (name === undefined) {
        return true;
    }
    const kind = importKindOf(sourceCode, name);
    return kind === 'named' && !usedBesidesExport(sourceCode, name);
}

function literalOf(element) {
    if (element.type === 'Character') {
        return String.fromCodePoint(element.value);
    }
    if (element.type === 'CharacterClass') {
        const [only] = element.elements;
        return !element.negate && element.elements.length === 1 && only.type === 'Character' ? String.fromCodePoint(only.value) : null;
    }
    if (element.type === 'Group' && element.alternatives.length === 1) {
        return literalOfAlternative(element.alternatives[0]);
    }
    if (element.type === 'Quantifier' && element.min === element.max) {
        const fragment = literalOf(element.element);
        return fragment === null ? null : fragment.repeat(element.min);
    }
    return null;
}

function literalOfAlternative(alternative) {
    let literal = '';
    for (const element of alternative.elements) {
        const fragment = literalOf(element);
        if (fragment === null) {
            return null;
        }
        literal += fragment;
    }
    return literal;
}

function replacesAPlainString(_context, descriptor) {
    const node = descriptor.node;
    if (descriptor.messageId !== 'method' || node?.type !== 'Identifier' || node.name !== 'replace') {
        return true;
    }
    const pattern = node.parent?.parent?.arguments?.[0];
    if (pattern?.type !== 'Literal' || pattern.regex === undefined) {
        return false;
    }
    const { flags } = pattern.regex;
    if (!flags.includes('g') || /[dimsy]/.test(flags)) {
        return false;
    }
    try {
        const parsed = new RegExpParser().parsePattern(pattern.regex.pattern, undefined, undefined, { unicode: flags.includes('u') });
        const literal = parsed.alternatives.length === 1 ? literalOfAlternative(parsed.alternatives[0]) : null;
        return literal !== null && literal.length > 0;
    } catch {
        return false;
    }
}

function typeOfNode(context, node) {
    const services = context.sourceCode.parserServices;
    if (services?.program === undefined) {
        return null;
    }
    return services.program.getTypeChecker().getTypeAtLocation(services.esTreeNodeToTSNodeMap.get(node));
}

function receiverOf(node) {
    if (node?.type === 'CallExpression') {
        return node.callee.type === 'MemberExpression' ? node.callee.object : null;
    }
    if (node?.type === 'MemberExpression') {
        return node.object;
    }
    if (node?.type === 'Identifier' && node.parent?.type === 'MemberExpression') {
        return node.parent.object;
    }
    return null;
}

function chainsAThenable(context, descriptor) {
    if (descriptor.messageId !== 'promise') {
        return true;
    }
    const receiver = receiverOf(descriptor.node);
    if (receiver === null) {
        return true;
    }
    const type = typeOfNode(context, receiver);
    if (type === null) {
        return true;
    }
    const parts = type.isUnion() ? type.types : [type];
    return parts.some((part) => part.getProperty('then') !== undefined || (part.flags & 1) !== 0);
}

function isValidUseStatePattern(node) {
    if (node.type !== 'ArrayPattern') {
        return false;
    }
    if (node.elements.length === 1) {
        return true;
    }
    const [getter, setter] = node.elements;
    if (getter?.type !== 'Identifier' || setter?.type !== 'Identifier' || !setter.name.startsWith('set')) {
        return false;
    }
    const suffix = setter.name.slice('set'.length);
    const isPrefixed = getter.name.startsWith('is') && getter.name.length > 'is'.length;
    return suffix === getter.name || (isPrefixed && suffix === getter.name.slice('is'.length));
}

function notAValidUseState(_context, descriptor) {
    return !isValidUseStatePattern(descriptor.node);
}

const HTML_TAGS = new Set(
    'a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script search section select slot small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr svg'.split(
        ' '
    )
);
const COMPOSITE_ROLES = new Set([
    'table',
    'grid',
    'treegrid',
    'listbox',
    'row',
    'rowgroup',
    'option',
    'cell',
    'gridcell',
    'columnheader',
    'rowheader',
    'tablist',
    'tab',
    'tabpanel',
    'tree',
    'treeitem',
    'menu',
    'menubar',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'radiogroup',
    'toolbar'
]);

function attributeNamed(opening, name) {
    return opening.attributes.find((attribute) => attribute.type === 'JSXAttribute' && attribute.name.name === name);
}

function literalAttribute(opening, name) {
    const value = attributeNamed(opening, name)?.value;
    if (value?.type === 'Literal') {
        return String(value.value);
    }
    return value?.type === 'JSXExpressionContainer' && value.expression.type === 'Literal' ? String(value.expression.value) : undefined;
}

function hasChildren(opening) {
    const element = opening.parent;
    return element?.type === 'JSXElement' && element.children.some((child) => child.type !== 'JSXText' || child.value.trim() !== '');
}

function hiddenFromEveryone(opening) {
    for (let node = opening; node !== null && node !== undefined; node = node.parent) {
        const element = node.type === 'JSXElement' ? node.openingElement : node.type === 'JSXOpeningElement' ? node : null;
        if (element !== null && literalAttribute(element, 'aria-hidden') === 'true') {
            return true;
        }
    }
    return false;
}

function isValidAriaPattern(opening, role) {
    const tag = opening.name.type === 'JSXIdentifier' ? opening.name.name : '';
    const has = (name) => attributeNamed(opening, name) !== undefined;
    const labelled = has('aria-label') || has('aria-labelledby');
    const hasTitle =
        opening.parent?.children?.some((child) => child.type === 'JSXElement' && child.openingElement.name.name === 'title') === true;
    const checks = {
        presentation: tag === 'svg' && hiddenFromEveryone(opening),
        img: (tag === 'svg' && (hiddenFromEveryone(opening) || labelled || hasTitle)) || hasChildren(opening) || has('style'),
        status: has('aria-live'),
        slider: has('aria-valuenow') && has('aria-valuemin') && has('aria-valuemax'),
        radio: has('aria-checked'),
        combobox: has('aria-expanded') || has('aria-controls'),
        separator: hasChildren(opening),
        group: false
    };
    return checks[role] === true || COMPOSITE_ROLES.has(role);
}

function roleOnAnHtmlElementWithoutAValidPattern(_context, descriptor) {
    const opening = descriptor.node;
    if (opening?.type !== 'JSXOpeningElement' || opening.name.type !== 'JSXIdentifier' || !HTML_TAGS.has(opening.name.name)) {
        return false;
    }
    const role = literalAttribute(opening, 'role');
    return role === undefined || !isValidAriaPattern(opening, role);
}

export const SONAR_DECORATORS = {
    S6754: notAValidUseState,
    S6819: roleOnAnHtmlElementWithoutAValidPattern,
    S7785: chainsAThenable,
    S107: countsOverMax,
    S7727: callsOnArrayWithWideCallback,
    S7763: reExportsAnImport,
    S7781: replacesAPlainString
};

export function decorated(rule, key) {
    const keep = SONAR_DECORATORS[key];
    return keep === undefined ? rule : intercept(rule, keep);
}
