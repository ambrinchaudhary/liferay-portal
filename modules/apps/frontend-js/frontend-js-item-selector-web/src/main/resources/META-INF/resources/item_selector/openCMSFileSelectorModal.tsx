/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayIcon from '@clayui/icon';
import {ClayVerticalNav} from '@clayui/nav';
import {EConfigInURLBehavior} from '@liferay/frontend-data-set-web';
import {render} from '@liferay/frontend-js-react-web';
import {fetch, mimeTypeUtils} from 'frontend-js-web';
import React, {useState} from 'react';

import CMSFileUploaderComponent from '../item_selector_file_uploader/CMSFileUploaderComponent';
import DetachedCMSFilesItemSelectorModal from './DetachedCMSFilesItemSelectorModal';
import {
	AnyFileItem,
	CMSFile,
	CMSFileItemSelectorModalConfig,
	CMSFileItemSelectorModalProps,
	DLFile,
	Site,
} from './types';
import {
	getCMSItemSelectorFilters,
	getCMSItemSelectorGroupedFilters,
} from './getCMSItemSelectorFilters';

const DL_FILE_ENTRY_CLASS_NAME =
	'com.liferay.document.library.kernel.model.DLFileEntry';

function urlBuilder({
	base = location.origin,
	filters = [],
	folderId,
	resource = '/o/search/v1.0/search',
}: {
	base?: string;
	filters?: string[];
	folderId?: number | null;
	resource?: string;
}) {
	const finalURL = new URL(resource, base);

	const scopePredicates = folderId
		? [`(folderId eq ${folderId})`]
		: [
				'(cmsRoot eq true)',
				"(cmsSection eq 'files')",
				'(rootDescendantNode eq false)',
			];

	const filter = [...scopePredicates, '(status in (0, 2, 3))']
		.concat(filters.filter(Boolean))
		.join(' and ');

	finalURL.search = new URLSearchParams({
		emptySearch: 'true',
		filter,
		nestedFields: 'description,embedded,file.mimeType,file.thumbnailURL',
	}).toString();

	return finalURL.toString();
}

function buildDLApiURL(
	extensions: string[],
	siteId: number,
	_folderId: number | null
): string {
	const url = new URL('/o/search/v1.0/search', location.origin);

	const predicates = [`(scopeGroupId eq ${siteId})`, '(status eq 0)'];

	if (extensions.length) {
		const extList = extensions.map((ext) => `'${ext}'`).join(',');

		predicates.push(`(extension in (${extList}))`);
	}

	url.search = new URLSearchParams({
		emptySearch: 'true',
		entryClassNames: DL_FILE_ENTRY_CLASS_NAME,
		filter: predicates.join(' and '),
		nestedFields: 'embedded',
	}).toString();

	return url.toString();
}

async function fetchSites(): Promise<Site[]> {
	try {
		const companyGroupId = Number(
			(
				Liferay.ThemeDisplay as unknown as {
					getCompanyGroupId: () => number;
				}
			).getCompanyGroupId()
		);

		const response = await fetch(
			'/o/headless-admin-user/v1.0/my-user-account/sites'
		);

		const data: Record<string, unknown> | null = response.ok
			? await response.json()
			: null;

		const sites: Site[] = (
			(
				data?.items as Array<{
					descriptiveName?: string;
					id: number;
					name: string;
				}>
			) ?? []
		)
			.filter((site) => site.id !== companyGroupId)
			.map((site) => ({
				id: site.id,
				kind: 'site' as const,
				name: site.descriptiveName || site.name,
			}));

		sites.push({
			id: companyGroupId,
			kind: 'global',
			name: Liferay.Language.get('global'),
		});

		return sites;
	}
	catch {
		return [];
	}
}

function normalizeDLItem(item: DLFile): CMSFile {
	const title = item.title || item.embedded.title || item.embedded.name || '';

	return {
		description: '',
		embedded: {
			file: {
				link: {href: item.embedded.contentUrl ?? ''},
				mimeType: item.embedded.encodingFormat ?? '',
				thumbnailURL: item.embedded.contentUrl ?? '',
			},
			id: item.embedded.id,
			title,
		},
		title,
	};
}

const CMS_FILE_ITEM_SELECTOR_CONFIG: CMSFileItemSelectorModalConfig = {
	apiURL: urlBuilder({}),
	items: [],
	locator: {
		id: 'embedded.id',
		label: 'embedded.title',
		value: 'embedded.id',
	},
	multiSelect: false,
};

const FDS_PROPS: Omit<
	CMSFileItemSelectorModalProps['fdsProps'],
	'filters' | 'id' | 'items'
> = {
	configInURLBehavior: EConfigInURLBehavior.OFF,
	pagination: {
		deltas: [{label: 20}, {label: 40}, {label: 60}],
		initialDelta: 20,
	},
	views: [
		{
			contentRenderer: 'cards',
			label: Liferay.Language.get('cards'),
			name: 'cards',
			schema: {
				description: 'description',
				symbol: '',
				title: 'title',
			},

			setItemComponentProps: ({
				item,
				props: initialProps,
			}: {
				item: AnyFileItem;
				props: object;
			}) => {
				const embedded = item.embedded ?? {};

				const props = {
					...initialProps,
					title:
						(initialProps as {title?: string}).title ||
						item.title ||
						embedded.title ||
						embedded.name ||
						'',
				};

				if (embedded.file) {
					const mimeType = embedded.file.mimeType || '';

					return {
						...props,
						imgProps: {src: embedded.file.thumbnailURL},
						stickerProps: {
							className:
								mimeTypeUtils.getClassNameFromMimeType(
									mimeType
								),
							content: (
							<ClayIcon
								symbol={mimeTypeUtils.getIconFromMimeType(
									mimeType
								)}
							/>
						),
						displayType: 'unstyled',
					},
				};
			}

				if (embedded.videoURL) {
					return {
						...props,
						stickerProps: {
							className: 'file-icon-color-3',
							content: <ClayIcon symbol="document-multimedia" />,
							displayType: 'unstyled',
						},
					};
				}

				if (embedded.contentUrl) {
					const mimeType = embedded.encodingFormat || '';

					return {
						...props,
						imgProps: mimeType.startsWith('image/')
							? {src: embedded.contentUrl}
							: undefined,
						stickerProps: {
							className:
								mimeTypeUtils.getClassNameFromMimeType(
									mimeType
								),
							content: (
								<ClayIcon
									symbol={mimeTypeUtils.getIconFromMimeType(
										mimeType
									)}
								/>
							),
							displayType: 'unstyled',
						},
					};
				}

				return {
					...props,
					stickerProps: {
						className: 'file-icon-color-5',
						displayType: 'unstyled',
					},
				};
			},

			thumbnail: 'cards2',
		},
		{
			contentRenderer: 'table',
			label: Liferay.Language.get('table'),
			name: 'table',
			schema: {
				fields: [
					{
						contentRenderer: 'cmsFilesTitleCellRenderer',
						fieldName: 'title',
						label: Liferay.Language.get('title'),
						sortable: true,
					},
					{
						contentRenderer: 'cmsFilesFallbackCellRenderer',
						fieldName: 'embedded.file.mimeType',
						label: Liferay.Language.get('type'),
						sortable: false,
					},
					{
						contentRenderer: 'cmsFilesFallbackCellRenderer',
						fieldName: 'embedded.file.size',
						label: Liferay.Language.get('size'),
						sortable: false,
					},
					{
						contentRenderer: 'dateTime',
						fieldName: 'dateModified',
						label: Liferay.Language.get('modified-date'),
						sortable: true,
					},
					{
						contentRenderer: 'dateTime',
						fieldName: 'dateCreated',
						label: Liferay.Language.get('create-date'),
						sortable: true,
					},
				],
			},
			thumbnail: 'table',
		},
	],
};

type Source = {icon: string; key: string; label: string};

const SOURCES: Source[] = [
	{icon: 'box-container', key: 'cms', label: 'Spaces'},
	{icon: 'sites', key: 'dm', label: 'Sites'},
	{icon: 'link', key: 'url', label: 'URL'},
];

function SourceSidebar() {
	const [activeSourceKey, setActiveSourceKey] = useState(SOURCES[0].key);

	const items = SOURCES.map((source) => ({
		active: activeSourceKey === source.key,
		label: (
			<>
				<ClayIcon
					className="inline-item inline-item-before"
					symbol={source.icon}
				/>

				{source.label}
			</>
		),
		onClick: () => setActiveSourceKey(source.key),
		textValue: source.label,
	}));

	return (
		<>
			<h3 className="p-2 text-2 text-secondary text-uppercase">
				{Liferay.Language.get('select-from')}
			</h3>

			<ClayVerticalNav
				aria-label={Liferay.Language.get('source')}
				displayType="primary"
				items={items}
				stacked
			/>
		</>
	);
}

function getRandomId(): string {
	return Math.random().toString(36).substring(2, 9);
}

function normalizeExtensions(allowedExtensions: string) {
	const cleanExtensions = allowedExtensions
		.split(',')
		.map((item) => item.trim().replace(/^\./, ''))
		.filter(Boolean);

	if (cleanExtensions.length < 1) {
		return '';
	}

	const extensions = cleanExtensions.map((item) => `'${item}'`).join(',');

	return `(extension in (${extensions}) or objectDefinitionExternalReferenceCode eq 'L_OBJECT_ENTRY_FOLDER')`;
}

export default function openCMSFileSelectorModal({
	allowDragAndDrop = false,
	allowedExtensions,
	config,
	fdsProps,
	filters,
	folderMemoryKey,
	groupId,
	itemTypeLabel,
	maxFileSize,
	onSelect,
}: {
	allowDragAndDrop?: boolean;
	allowedExtensions?: string;
	config?: Partial<CMSFileItemSelectorModalConfig>;
	fdsProps?: Partial<CMSFileItemSelectorModalProps['fdsProps']>;
	filters?: string[];

	/**
	 * Stable identifier of the field opening the selector. When provided, the
	 * selector reopens at the folder where this field's previous selection was
	 * made. Each field must pass its own key so the remembered folder is not
	 * shared between fields.
	 */
	folderMemoryKey?: string;
	groupId?: number;
	itemTypeLabel?: string;
	maxFileSize?: number;
	onSelect: (items: Array<CMSFile>) => void;
}) {
	let effectiveFilters: string[] = [];

	if (filters?.length) {
		effectiveFilters = filters;
	}
	else if (allowedExtensions) {
		effectiveFilters = [normalizeExtensions(allowedExtensions)];
	}

	const buildApiURL = (folderId: number | null) =>
		urlBuilder({
			filters: effectiveFilters,
			folderId: folderId ?? undefined,
		});

	const finalConfig = {
		...CMS_FILE_ITEM_SELECTOR_CONFIG,
		...config,
		apiURL: buildApiURL(null),
	};

	return render(
		DetachedCMSFilesItemSelectorModal,
		{
			...finalConfig,
			allowedExtensions,
			buildApiURL,
			fdsProps: {
				...FDS_PROPS,
				emptyState: allowDragAndDrop
					? {
							description: Liferay.Language.get(
								'drag-and-drop-to-upload'
							),
							image: '/states/cms_empty_state_files.svg',
							title: Liferay.Language.get('no-files-yet'),
						}
					: undefined,
				filters: getCMSItemSelectorFilters(
					groupId ?? Liferay.ThemeDisplay.getScopeGroupId()
				),
				groupedFilters: getCMSItemSelectorGroupedFilters(),
				hideManagementBarInEmptyState: true,
				...fdsProps,
				id: `CMSItemSelectorFDS_${getRandomId()}`,
			},
			filesUploaderComponent: allowDragAndDrop
				? CMSFileUploaderComponent
				: undefined,
			folderMemoryKey,
			groupId,
			itemTypeLabel: itemTypeLabel ?? Liferay.Language.get('files'),
			maxFileSize,
			onItemsChange: onSelect,
			sidebar: Liferay.FeatureFlags['LPD-95652'] ? (
				<SourceSidebar />
			) : undefined,
		},
		document.createElement('div')
	);
}
