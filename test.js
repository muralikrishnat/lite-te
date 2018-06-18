(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.liteTE = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    /**
        var match = expression
         .match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);
        var lhs = match[1];
        var rhs = match[2];
        var aliasAs = match[3];
        var trackByExp = match[4];
    */

    var forRegex = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/,
        isExpression = /{{(.+?)}}/g,
        isEvent = /^lc-(click|submit)/g;

        let events = {
            'lc-click': 'click',
            'lc-submit': 'submit'
        }

    function get(obj, path, defaultValue) {
        let patharr = path.trim().split('.');
        let value;
        let k;
        for (let i of patharr) {
            k = k ? k[i] : obj[i];
            if (k && typeof k !== 'object') {
                value = k;
                return value;
            }
        }
        if (typeof value === 'undefined') {
            if (typeof defaultValue !== 'undefined')
                value = defaultValue
            else
                value = '';
        }
        return value;
    }

    function _data(key) {
        return this.getAttribute('data-' + key);
    }

    function _getContext() {
        return (new Function(`return ${this.data('context')}`))();
    }

    function _getTemplate() {
        let template = (new Function(`return ${this.data('templateref')}`))();
        return (new DOMParser()).parseFromString(template, 'application/xml').children[0];
    }

    function addListeners(node, context) {
        let match;
        for(let prop of node.attributes) {
            if(match = isEvent.exec(prop.name)) {
                node.addEventListener(events[match[0]], get(context, prop.value).bind(context), false);
                //node['on'+ events[match[0]]] = get(context, prop.value).bind(context);
                node.removeAttribute(prop);
            }
        }
    }

    function _interpolate(node) {
        let cursor = 0;
        let text = '';
        while (match = isExpression.exec(node.nodeValue)) {
            text += node.nodeValue.slice(cursor, match.index) + get(this, match[1].trim());// this[match[1].trim()];
            cursor = match.index + match[0].length;
        }
        text += node.nodeValue.substr(cursor, node.nodeValue.length - cursor);
        node.nodeValue = text;
        return node;
    }

    function render(context, rootNode, parentNode) {
        let match;
        for (let node of rootNode.childNodes) {
            if (node.nodeType === 3) {
                _interpolate.call(context, node);
            } else if (node.nodeType === 1) {
                let forCond = node.attributes['data-for'];
                addListeners(node, context);
                if (!forCond) {
                    render(context, node, rootNode);
                } else {
                    match = forRegex.exec(forCond.value);
                    if (match) {
                        let clone = node.cloneNode(true);
                        clone.removeAttribute('data-for');
                        let lhs = match[1];
                        let rhs = context[match[2]];
                        for (let item of rhs) {
                            let reclone = clone.cloneNode(true);
                            let iobj = {
                                [lhs]: item
                            };
                            let _node = render(iobj, reclone, rootNode);
                            rootNode.appendChild(_node);
                        }
                        rootNode.removeChild(node);
                    } else {
                        throw Error('Expected expression in form of \'_item_ in _collection_[ track by _id_]\' but got \'{0}\'.',
                            forCond.value);
                    }
                }
            }
        }
        return rootNode;
    }

    let _context = Symbol('_context');
    let _template = Symbol('_template');
    let _init = Symbol('_init');

    class LiteComponent extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({
                mode: 'open'
            });
            this.data = _data.bind(this);
        }

        [_init]() {
            let ctx = _getContext.call(this);
            this[_context] = Object.assign({}, ctx.data, ctx.methods);
            this[_template] = _getTemplate.call(this);
            let node = render(this[_context], this[_template], null);
            //this.appendChild(node);
            this._shadowRoot.appendChild(node);//.outerHTML;
        }

        connectedCallback() {
            this[_init]();
        }
    }

    window.customElements.define('l-c', LiteComponent);
}));

