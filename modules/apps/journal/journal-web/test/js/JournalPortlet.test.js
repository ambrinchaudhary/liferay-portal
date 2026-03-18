/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {fetch} from 'frontend-js-web';
import JournalPortlet from '../../src/main/resources/META-INF/resources/js/JournalPortlet.es';

jest.mock('frontend-js-web', () => ({
	debounce: (fn) => {
		let timeout;

		return function(...args) {
			const context = this;

			clearTimeout(timeout);

			timeout = setTimeout(() => fn.apply(context, args), 0);
		};
	},
	fetch: jest.fn(),
	navigate: jest.fn(),
	sub: jest.fn((str, val) => str.replace('{0}', val)),
}));

jest.mock('frontend-js-components-web', () => ({
	openConfirmModal: jest.fn(),
}));

jest.mock('../../src/main/resources/META-INF/resources/js/LocaleChangedHandler.es', () => ({
	LocaleChangedHandler: jest.fn().mockImplementation(() => ({
		detach: jest.fn(),
	})),
}));

describe('JournalPortlet', () => {
	const namespace = '_namespace_';
	const autoSaveDraftURL = '/autosave';
	const formId = `${namespace}fm1`;

	let form;
	let titleInput;
	let articleIdInput;
	let versionInput;
	let formDateInput;
	let actionInput;

	beforeEach(() => {
		document.body.innerHTML = `
			<form id="${formId}" method="POST">
				<input id="${namespace}jakarta-portlet-action" name="${namespace}jakarta-portlet-action" value="/old_action" />
				<input id="${namespace}articleId" name="${namespace}articleId" value="" />
				<input id="${namespace}newArticleId" name="${namespace}newArticleId" value="new-123" />
				<input id="${namespace}version" name="${namespace}version" value="1.0" />
				<input id="${namespace}formDate" name="${namespace}formDate" value="123456789" />
				<input id="${namespace}availableLocales" name="${namespace}availableLocales" value="en_US" />
				<input name="${namespace}title" value="Initial Title" />
				<button id="${namespace}publishButton"></button>
				<button id="${namespace}saveButton"></button>
				<button id="${namespace}resetValuesButton"></button>
				<div id="${namespace}articleIdWrapper" class="hide"></div>
				<div id="${namespace}articleVersionStatusWrapper" class="hide"></div>
				<span id="${namespace}displayedArticleId"></span>
				<span id="${namespace}displayedVersion"></span>
				<span id="${namespace}statusDraftLabel" class="hide"></span>
				<div id="${namespace}statusLabel" class="hide"></div>
			</form>
			<button id="${namespace}contextualSidebarButton"></button>
			<div id="${namespace}contextualSidebarContainer"></div>
		`;

		form = document.getElementById(formId);
		articleIdInput = document.getElementById(`${namespace}articleId`);
		versionInput = document.getElementById(`${namespace}version`);
		formDateInput = document.getElementById(`${namespace}formDate`);
		actionInput = document.getElementById(`${namespace}jakarta-portlet-action`);

		global.Liferay = {
			BREAKPOINTS: {PHONE: 480},
			FeatureFlags: {'LPD-11228': true},
			Language: {get: jest.fn((key) => key)},
			Workflow: {ACTION_SAVE_DRAFT: 'save_draft'},
			component: jest.fn((id) => {
				if (id.includes('titleMapAsXML')) {
					return {
						getValue: () => 'Some Title',
					};
				}

				return null;
			}),
			componentReady: jest.fn().mockResolvedValue({
				lock: jest.fn(),
				unlock: jest.fn(),
				isLocked: jest.fn(() => false),
			}),
			fire: jest.fn(),
			on: jest.fn(() => ({detach: jest.fn()})),
		};

		fetch.mockReset();
		fetch.mockResolvedValue({
			json: () => Promise.resolve({
				articleId: 'new-123',
				friendlyURL: '/friendly',
				modifiedDate: 987654321,
				success: true,
				version: '1.1',
			}),
			redirected: false,
		});
	});

	it('should not trigger auto-save if form data has not changed', async () => {
		const portlet = JournalPortlet({
			articleId: '',
			autoSaveDraftEnabled: true,
			autoSaveDraftURL,
			availableLocales: ['en_US'],
			classNameId: '0',
			contentTitle: 'titleMapAsXML',
			defaultLanguageId: 'en_US',
			hasSavePermission: true,
			namespace,
		});

		// Wait for componentReady callbacks to execute
		await new Promise(resolve => setTimeout(resolve, 0));

		// Simulate a change event on the form but with same values
		form.dispatchEvent(new Event('change'));

		// Wait for debounced callback
		await new Promise(resolve => setTimeout(resolve, 0));

		expect(fetch).not.toHaveBeenCalled();

		portlet.dispose();
	});

	it('should trigger auto-save when form data changes', async () => {
		const portlet = JournalPortlet({
			articleId: '',
			autoSaveDraftEnabled: true,
			autoSaveDraftURL,
			availableLocales: ['en_US'],
			classNameId: '0',
			contentTitle: 'titleMapAsXML',
			defaultLanguageId: 'en_US',
			hasSavePermission: true,
			namespace,
		});

		// Wait for componentReady callbacks to execute
		await new Promise(resolve => setTimeout(resolve, 0));

		// Change a value
		const titleInput = form.querySelector(`input[name="${namespace}title"]`);
		titleInput.value = 'Updated Title';

		// Trigger change
		form.dispatchEvent(new Event('change'));

		// Wait for debounced callback
		await new Promise(resolve => setTimeout(resolve, 0));

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith(autoSaveDraftURL, expect.any(Object));

		portlet.dispose();
	});

	it('should not trigger auto-save twice if data has not changed after first save', async () => {
		const portlet = JournalPortlet({
			articleId: '',
			autoSaveDraftEnabled: true,
			autoSaveDraftURL,
			availableLocales: ['en_US'],
			classNameId: '0',
			contentTitle: 'titleMapAsXML',
			defaultLanguageId: 'en_US',
			hasSavePermission: true,
			namespace,
		});

		// Wait for componentReady callbacks to execute
		await new Promise(resolve => setTimeout(resolve, 0));

		// First change
		const titleInput = form.querySelector(`input[name="${namespace}title"]`);
		titleInput.value = 'Updated Title';
		form.dispatchEvent(new Event('change'));

		// Wait for debounced callback
		await new Promise(resolve => setTimeout(resolve, 0));

		expect(fetch).toHaveBeenCalledTimes(1);

		// Wait for promise resolution (submitAsyncForm updating lastFormData)
		await new Promise(resolve => setTimeout(resolve, 0));

		// Second change event but with same value
		form.dispatchEvent(new Event('change'));

		// Wait for debounced callback
		await new Promise(resolve => setTimeout(resolve, 0));

		expect(fetch).toHaveBeenCalledTimes(1);

		portlet.dispose();
	});

	it('should trigger auto-save again if data changed again after first save', async () => {
		const portlet = JournalPortlet({
			articleId: '',
			autoSaveDraftEnabled: true,
			autoSaveDraftURL,
			availableLocales: ['en_US'],
			classNameId: '0',
			contentTitle: 'titleMapAsXML',
			defaultLanguageId: 'en_US',
			hasSavePermission: true,
			namespace,
		});

		// Wait for componentReady callbacks to execute
		await new Promise(resolve => setTimeout(resolve, 0));

		// First change
		const titleInput = form.querySelector(`input[name="${namespace}title"]`);
		titleInput.value = 'Updated Title 1';
		form.dispatchEvent(new Event('change'));

		// Wait for debounced callback
		await new Promise(resolve => setTimeout(resolve, 0));

		expect(fetch).toHaveBeenCalledTimes(1);

		// Wait for promise resolution (submitAsyncForm updating lastFormData)
		await new Promise(resolve => setTimeout(resolve, 0));

		// Second change
		titleInput.value = 'Updated Title 2';
		form.dispatchEvent(new Event('change'));

		// Wait for debounced callback
		await new Promise(resolve => setTimeout(resolve, 0));

		expect(fetch).toHaveBeenCalledTimes(2);

		portlet.dispose();
	});
});
