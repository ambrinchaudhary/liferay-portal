import Component from 'metal-component/src/Component';
import Soy from 'metal-soy/src/Soy';
import core from 'metal/src/core';

import Dropdown from 'metal-dropdown/src/Dropdown';

import CompatibilityEventProxy from 'frontend-js-web/liferay/CompatibilityEventProxy.es'

import templates from './TranslationManager.soy';

class TranslationManager extends Component {
	/**
	 * @inheritDoc
	 */
	constructor(opt_config, opt_element) {
		super(opt_config, opt_element);

		this.resetEditingLocale_();

		this.startCompatibility_();
	}

	/**
	 * Add a language to the available locales list and set it as the
	 * current editing language.
	 *
	 * @param  {MouseEvent} event
	 */
	addLocale(event) {
		let localeId = event.currentTarget.getAttribute('data-locale-id');

		if (this.availableLocales.indexOf(localeId) === -1) {
			this.availableLocales.push(localeId);
		}

		this.availableLocales = this.availableLocales;

		this.editingLocale = localeId;
	}

	/**
	 * Registers another EventTarget as a bubble target.
	 *
	 * @param  {!Object} target
	 */
	addTarget(target) {
		this.compatibilityEventProxy_.addTarget(target);
	}

	/**
	 * Change the default language.
	 *
	 * @param  {MouseEvent} event
	 */
	changeDefaultLocale(event) {
		let localeId = event.currentTarget.getAttribute('data-locale-id');

		this.defaultLocale = localeId;

		this.editingLocale = localeId;
	}

	/**
	 * Change current editing language.
	 *
	 * @param  {MouseEvent} event
	 */
	changeLocale(event) {
		let localeId = event.delegateTarget.getAttribute('data-locale-id');

		this.editingLocale = localeId;
	}

	/**
	 * Remove a language from the available locales list and reset the current
	 * editing language to default if removed one was selected.
	 *
	 * @param  {MouseEvent} event
	 */
	removeAvailableLocale(event) {
		let localeId = event.currentTarget.getAttribute('data-locale-id');

		let localePosition = this.availableLocales.indexOf(localeId);

		this.availableLocales.splice(localePosition, 1);

		this.availableLocales = this.availableLocales;

		if (localeId === this.editingLocale) {
			this.resetEditingLocale_();
		}

		this.emit(
			'deleteAvailableLocale',
			{
				locale: localeId
			}
		);
	}

	/**
	 * Set the current editing locale to the default locale.
	 *
	 */
	resetEditingLocale_() {
		this.editingLocale = this.defaultLocale;
	}

	/**
	 * Configuration to emit yui-based events to maintain
	 * backwards compatibility.
	 *
	 */
	startCompatibility_() {
		this.compatibilityEventProxy_ = new CompatibilityEventProxy(
			{
				host: this,
				namespace: 'translationmanager'
			}
		);
	}
	
}

TranslationManager.STATE = {
	/**
	 * Current editing language key.
	 * @type {String}
	 */
	editingLocale: {
		validator: core.isString
	},

	/**
	 * List of available languages keys.
	 * @type {Array.<String>}
	 */
	availableLocales: {
		validator: core.isArray
	},

	/**
	 * Indicates if the default language is editable or not.
	 * @type {Array.<String>}
	 */
	changeableDefaultLanguage: {
		validator: core.isBoolean
	},

	/**
	 * Default language key.
	 * @type {String}
	 */
	defaultLocale: {
		validator: core.isString
	},

	/**
	 * Map of all languages
	 * @type {Array.<String>}
	 */
	locales: {
		validator: core.isObject
	}
};

// Register component
Soy.register(TranslationManager, templates);

export default TranslationManager;