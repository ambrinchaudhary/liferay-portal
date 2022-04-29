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

import {SelectTypeAndSubtype} from '@liferay/content-dashboard-web';
import React from 'react';

const testProps = {
	contentDashboardItemTypes: [
		{
			icon: 'documents-and-media',
			itemSubtypes: [
				{
					className:
						'com.liferay.document.library.kernel.model.DLFileEntryType',
					classPK: '0',
					label: 'Basic Document',
					selected: false,
				},
				{
					className:
						'com.liferay.document.library.kernel.model.DLFileEntryType',
					classPK: '40709',
					label: 'External Video Shortcut',
					selected: false,
				},
				{
					className:
						'com.liferay.document.library.kernel.model.DLFileEntryType',
					classPK: '40761',
					label: 'Google Drive Shortcut',
					selected: false,
				},
			],

			label: 'Document',
		},
	],
	itemSelectorSaveEvent:
		'_com_liferay_content_dashboard_web_portlet_ContentDashboardAdminPortlet_selectedContentDashboardItemSubtype',
	portletNamespace:
		'_com_liferay_item_selector_web_portlet_ItemSelectorPortlet_',
};

export default function (props) {
	return <SelectTypeAndSubtype {...testProps} />;
}
