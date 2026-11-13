/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {openSelectionModal} from 'frontend-js-components-web';

import {config} from '../app/config/index';

export type SelectedImage = {
	classNameId?: number | string;
	classPK?: number | string;
	fileEntryId?: number | string;
	title?: string;
	url?: string;
};

type SelectedItem = {
	returnType: string;
	value: string;
};

type FileEntry = {
	classNameId: number | string;
	fileEntryId: number | string;
	title: string;
	url: string;
};

/**
 * PoC: the image editable opens the unified selector (Documents and Media of
 * sites, Global and asset libraries, CMS Spaces and URL). It is loaded at
 * runtime from the URL the build gives to @liferay/frontend-js-item-selector-web
 * (bare specifiers are not in the import map), so this module does not need
 * to depend on it. Run localStorage.setItem('poc-unified-selector', 'off') to
 * get the legacy selector back.
 */
const UNIFIED_SELECTOR_MODULE = `${Liferay.ThemeDisplay.getPathContext()}/o/frontend-js-item-selector-web/__liferay__/index.js`;

function isUnifiedSelectorEnabled() {
	try {
		return localStorage.getItem('poc-unified-selector') !== 'off';
	}
	catch (error) {
		return true;
	}
}

function openUnifiedImageSelector(
	callback: (image: SelectedImage) => void,
	destroyedCallback?: () => void
) {
	const scopeGroupId = Number(Liferay.ThemeDisplay.getScopeGroupId());

	import(/* @vite-ignore */ UNIFIED_SELECTOR_MODULE)
		.then(({openUnifiedFileSelectorModal}) => {
			openUnifiedFileSelectorModal({
				allowDragAndDrop: true,
				allowedExtensions:
					'.apng,.avif,.gif,.jpg,.jpeg,.png,.svg,.tiff,.webp',
				groupId: scopeGroupId,
				initialSiteId: scopeGroupId,
				initialSource: 'dl',
				itemTypeLabel: Liferay.Language.get('image'),
				onSelect: (items: Array<{title: string; url?: string}>) => {
					const item = items[0];

					if (item?.url) {
						callback({title: item.title, url: item.url});
					}

					destroyedCallback?.();
				},
			});
		})
		.catch((error) => {
			console.error(error);

			destroyedCallback?.();
		});
}

export function openImageSelector(
	callback: (image: SelectedImage) => void,
	destroyedCallback?: () => void
) {
	if (isUnifiedSelectorEnabled()) {
		openUnifiedImageSelector(callback, destroyedCallback);

		return;
	}

	openSelectionModal<SelectedItem>({
		onClose: destroyedCallback,
		onSelect: (selectedItem) => {
			const {returnType, value} = selectedItem;

			const selectedImage: SelectedImage = {};

			if (returnType === 'URL') {
				selectedImage.title = '';
				selectedImage.url = value;
			}
			else {
				const fileEntry = JSON.parse(value) as FileEntry;

				selectedImage.classNameId = fileEntry.classNameId;
				selectedImage.classPK = fileEntry.fileEntryId;
				selectedImage.fileEntryId = fileEntry.fileEntryId;
				selectedImage.title = fileEntry.title;
				selectedImage.url = fileEntry.url;
			}

			callback(selectedImage);
		},
		selectEventName: `${config.portletNamespace}selectImage`,
		title: Liferay.Language.get('select'),
		url: config.imageSelectorURL,
	});
}
