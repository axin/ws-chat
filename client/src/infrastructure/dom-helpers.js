// Collection of helper functions aimed to relieve creation of DOM elements

/**
 * Creates DOM element.
 * @param {string} tagName
 * @param {object} [attributes]
 * @param {(HTMLElement|TextNode)[]} [childNodes]
 * @returns {HTMLElement}
 */
export function element() {
    const tagName = arguments[0];

    if ((arguments.length === 0) || (typeof (tagName) !== 'string')) {
        throw new Error('Tag name should be passed as a first argument.');
    }

    const resultElement = document.createElement(tagName);
    const secondArgument = arguments[1];

    const setChildNodes = childNodes => {
        if (!Array.isArray(childNodes)) {
            return;
        }

        const fragment = document.createDocumentFragment();
        for (let childNode of childNodes) {
            if (childNode instanceof Node) {
                fragment.appendChild(childNode);
            } else if (childNode.dom instanceof Node) {
                // Child node is a component
                fragment.appendChild(childNode.dom);
            } else {
                continue;
            }
        }

        resultElement.appendChild(fragment);
    };

    if (secondArgument) {
        // Second argument contains elenent attibutes
        if ((!Array.isArray(secondArgument)) && (typeof (secondArgument) === 'object')) {
            Object.assign(resultElement, secondArgument);
            setChildNodes(arguments[2]);
        } else {
            setChildNodes(secondArgument);
        }
    }

    return resultElement;
}

export function text(text) {
    return document.createTextNode(text);
}

export const div = creteTagHelper('div');
export const span = creteTagHelper('span');
export const a = creteTagHelper('a');
export const ul = creteTagHelper('ul');
export const ol = creteTagHelper('ol');
export const li = creteTagHelper('li');
export const p = creteTagHelper('p');
export const h1 = creteTagHelper('h1');
export const h2 = creteTagHelper('h2');
export const h3 = creteTagHelper('h3');
export const form = creteTagHelper('form');
export const textarea = creteTagHelper('textarea');
export const button = creteTagHelper('button');
export const input = creteTagHelper('input');

function creteTagHelper(tagName) {
    return function () {
        return element.call(null, tagName, ...arguments);
    };
}
