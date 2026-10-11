const DIRECTIVE =
    /^[\s/]*(eslint-disable|eslint-enable|eslint\s|global\s|globals\s|exported\s|prettier-ignore|@ts-expect-error|@ts-ignore|@ts-nocheck|<reference)/;

const noComments = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Sem comentário solto no código. O porquê vive na mensagem de commit e no PR; a exceção é JSDoc (/** */) numa declaração, que aparece no hover de quem usa.'
        },
        schema: [],
        messages: {
            found: 'Comentário no código. O porquê vai na mensagem de commit ou no PR; se a declaração precisa de explicação no uso, escreva JSDoc (/** */). Diretivas (eslint-disable, @ts-expect-error) continuam liberadas.'
        }
    },
    create(context) {
        return {
            Program() {
                for (const comment of context.sourceCode.getAllComments()) {
                    const docBlock = comment.type === 'Block' && comment.value.startsWith('*');
                    if (comment.type === 'Shebang' || docBlock || DIRECTIVE.test(comment.value)) {
                        continue;
                    }
                    context.report({ loc: comment.loc, messageId: 'found' });
                }
            }
        };
    }
};

const noElse = {
    meta: {
        type: 'problem',
        docs: { description: 'Sem else. Trate o caso de saída primeiro e devolva; o caminho normal fica no nível de fora.' },
        schema: [],
        messages: {
            found: 'else. Inverta a condição e devolva cedo — o caminho normal do método não deve viver dentro de um bloco.'
        }
    },
    create(context) {
        return {
            IfStatement(node) {
                if (node.alternate) {
                    context.report({ node: node.alternate, messageId: 'found' });
                }
            }
        };
    }
};

const LOOPS = new Set(['ForStatement', 'ForOfStatement', 'ForInStatement', 'WhileStatement', 'DoWhileStatement']);
const ITERATORS = new Set(['map', 'forEach', 'filter', 'flatMap', 'reduce', 'some', 'every', 'find', 'findIndex']);
const SEARCHES = new Set(['find', 'findIndex', 'includes', 'indexOf', 'filter']);
const ARRAY_TYPE = /(\[\]|^(readonly )?(Readonly)?Array<)/;

function iteratingAncestor(node) {
    let current = node.parent;
    while (current) {
        if (LOOPS.has(current.type)) {
            return current;
        }
        if (isIteratorCallback(current)) {
            return current;
        }
        current = current.parent;
    }
    return null;
}

function isIteratorCallback(node) {
    if (node.type !== 'ArrowFunctionExpression' && node.type !== 'FunctionExpression') {
        return false;
    }
    const call = node.parent;
    return call?.type === 'CallExpression' && call.callee?.type === 'MemberExpression' && ITERATORS.has(call.callee.property?.name ?? '');
}

const noSearchInLoop = {
    meta: {
        type: 'problem',
        docs: { description: 'Sem varredura de array dentro de iteração: é o quadrático que ninguém vê até a base crescer.' },
        schema: [],
        messages: {
            found: 'Busca em array ({{name}}) dentro de outra iteração: isso é O(n²). Monte um Map ou Set antes do laço e consulte por chave.'
        }
    },
    create(context) {
        const services = context.sourceCode.parserServices;
        if (!services?.program || !services.esTreeNodeToTSNodeMap) {
            return {};
        }
        const checker = services.program.getTypeChecker();
        const searchesAnArray = (receiver) => {
            const tsNode = services.esTreeNodeToTSNodeMap.get(receiver);
            if (!tsNode) {
                return false;
            }
            return ARRAY_TYPE.test(checker.typeToString(checker.getTypeAtLocation(tsNode)));
        };
        return {
            CallExpression(node) {
                const name = node.callee?.type === 'MemberExpression' ? (node.callee.property?.name ?? '') : '';
                if (!SEARCHES.has(name) || !iteratingAncestor(node) || !searchesAnArray(node.callee.object)) {
                    return;
                }
                context.report({ node, messageId: 'found', data: { name } });
            }
        };
    }
};

export default {
    rules: {
        'no-comments': noComments,
        'no-else': noElse,
        'no-search-in-loop': noSearchInLoop
    }
};
