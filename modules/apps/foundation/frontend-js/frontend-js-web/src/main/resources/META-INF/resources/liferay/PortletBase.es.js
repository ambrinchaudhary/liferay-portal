import core from 'metal/src/core';
import dom from 'metal-dom/src/dom';
import State from 'metal-state/src/State';
import string from 'metal/src/string/string';

class PortletBase extends State {
	constructor(config) {
		super(config);

		var namespace;

		if ('namespace' in config) {
			namespace = config.namespace;
		}
		else {
			namespace = '_' + string.getRandomString() + '_';
		}

		this.NS = namespace;
		this.ID = namespace.replace(/^_(.*)_$/, '$1');

		if (config.rootNode) {
			this.rootNode = config.rootNode;
		}
	}

	getNamespace_(value) {
		return this.NS;
	}

	getRootNode_(value) {
		return this.rootNode;
	}

	setRootNode_(value) {
		return dom.toElement(value);
	}

	formatSelectorNamespace_(ns, selector) {
		return selector.replace(new RegExp('(#|\\[id=(\\\"|\\\'))(?!' + ns + ')', 'g'), '$1' + ns);
	}

	all(selector, root) {
		root = dom.toElement(root) || this.rootNode || document;

		return root.querySelectorAll(this.formatSelectorNamespace_(this.NS, selector));
	}

	ns(str) {
		return Liferay.Util.ns(this.NS, str);
	}

	one(selector, root) {
		root = dom.toElement(root) || this.rootNode || document;

		return root.querySelector(this.formatSelectorNamespace_(this.NS, selector));
	}
}

PortletBase.STATE = {
	namespace: {
		validator: core.isString,
		getter: 'getNamespace_'
	},
	rootNode: {
		getter: 'getRootNode_',
		setter: 'setRootNode_'
	}
};

export default PortletBase;