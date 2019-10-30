/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import ItemSelectorDialog from 'frontend-js-web/liferay/ItemSelectorDialog.es';

export default function seoInit({itemSelectorUrl, namespace}) {
	const openGraphImageButton = document.getElementById(
		`${namespace}openGraphImageButton`
	);

	if (openGraphImageButton) {
		const itemSelectorDialog = new ItemSelectorDialog({
			buttonAddLabel: Liferay.Language.get('done'),
			eventName: `${namespace}openGraphImageSelectedItem`,
			title: Liferay.Language.get('open-graph-image'),
			url: itemSelectorUrl
		});

		itemSelectorDialog.on('selectedItemChange', event => {
			debugger;
			const selectedItem = event.selectedItem;

			if (!selectedItem) {
				return;
			}
			const itemValue = JSON.parse(selectedItem.value);

			const openGraphImageFileEntryId = document.getElementById(
				`${namespace}openGraphImageFileEntryId`
			);

			if (openGraphImageFileEntryId) {
				openGraphImageFileEntryId.value = itemValue.fileEntryId;
			}

			const openGraphImageURL = document.getElementById(
				`${namespace}openGraphImageURL`
			);

			if (openGraphImageURL) {
				openGraphImageURL.value = itemValue.url;
			}
		});

		openGraphImageButton.addEventListener('click', event => {
			event.preventDefault();
			itemSelectorDialog.open();
		});
	}
}
