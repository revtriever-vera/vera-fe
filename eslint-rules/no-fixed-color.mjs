const BRACKET_COLOR = /\[(?:[a-z-]+:)?(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\()/;
const RAW_COLOR = /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\()/;
const COLOR_PROPERTY = /^(color|background|backgroundColor|borderColor|borderTopColor|borderBottomColor|fill|stroke|outlineColor)$/;
const CLASS_ATTRIBUTES = new Set(['className', 'class']);
const DESIGN_SYSTEM_CALLS = new Set(['cn', 'cva']);

function classNameHost(ancestors) {
    return ancestors.some((node) => node.type === 'JSXAttribute' && CLASS_ATTRIBUTES.has(node.name?.name));
}

function designSystemCall(ancestors) {
    return ancestors.some(
        (node) => node.type === 'CallExpression' && node.callee?.type === 'Identifier' && DESIGN_SYSTEM_CALLS.has(node.callee.name)
    );
}

function colorStyleProperty(node, ancestors) {
    const parent = ancestors[ancestors.length - 1];
    return (
        parent?.type === 'Property' && parent.value === node && parent.key?.type === 'Identifier' && COLOR_PROPERTY.test(parent.key.name)
    );
}

const noFixedColor = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Sem cor fixa: classe Tailwind com hex/rgb/hsl/oklch embutido ou style com cor literal. Só tokens semânticos do design system (src/index.css).'
        },
        schema: [],
        messages: {
            className: 'Cor literal em classe Tailwind — use um token semântico do design system (bg-surface, text-accent...).',
            style: 'Cor literal em style — use var(--color-...) do design system.'
        }
    },
    create(context) {
        function checkTailwindText(node, text) {
            if (BRACKET_COLOR.test(text)) {
                context.report({ node, messageId: 'className' });
            }
        }

        return {
            Literal(node) {
                if (typeof node.value !== 'string') {
                    return;
                }
                const ancestors = context.sourceCode.getAncestors(node);
                if (classNameHost(ancestors) || designSystemCall(ancestors)) {
                    checkTailwindText(node, node.value);
                    return;
                }
                if (colorStyleProperty(node, ancestors) && RAW_COLOR.test(node.value)) {
                    context.report({ node, messageId: 'style' });
                }
            },
            TemplateElement(node) {
                const ancestors = context.sourceCode.getAncestors(node);
                if (classNameHost(ancestors) || designSystemCall(ancestors)) {
                    checkTailwindText(node, node.value.raw);
                }
            }
        };
    }
};

export default { rules: { 'no-fixed-color': noFixedColor } };
