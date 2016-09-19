
import dom from 'metal-dom/src/dom';
import PortletBase from 'frontend-js-web/liferay/PortletBase.es';


/**
 * WikiPortlet
 */
class WikiPortlet extends PortletBase {
	constructor(options) {
		super(options);

		this.bindUI_();
	}

	bindUI_() {
		console.log('ns: ' + this.ns('ambrin'));
	}

	getElement(elementId) {
		var node = this.one(elementId);
		console.log(node);
	}
}

export default WikiPortlet;

