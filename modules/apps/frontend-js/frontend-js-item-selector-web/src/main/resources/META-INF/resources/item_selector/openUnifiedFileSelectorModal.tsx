/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {ClayInput, ClaySelect} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import {EConfigInURLBehavior} from '@liferay/frontend-data-set-web';
import {render} from '@liferay/frontend-js-react-web';
import {
	FileData,
	MultipleFileUploader,
	UploadRequestCallback,
} from 'frontend-js-components-web';
import {fetch, mimeTypeUtils} from 'frontend-js-web';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import CMSFileUploaderComponent from '../item_selector_file_uploader/CMSFileUploaderComponent';
import DetachedCMSFilesItemSelectorModal from './DetachedCMSFilesItemSelectorModal';
import {
	getCMSItemSelectorFilters,
	getCMSItemSelectorGroupedFilters,
} from './getCMSItemSelectorFilters';

/**
 * PoC: one selector for both kinds of files.
 *
 * - "Spaces (CMS)": files of the CMS Spaces (object entries), same query as
 *   openCMSFileSelectorModal.
 * - "Documents and Media": DLFileEntry/DLFolder of a site, through the same
 *   search API, so both sources share the data set, the views and the
 *   selection key (embedded.id).
 *
 * onSelect receives normalized items, whatever the source.
 */

const DL_FILE_ENTRY_CLASS_NAME =
	'com.liferay.document.library.kernel.model.DLFileEntry';

const DL_FOLDER_CLASS_NAME =
	'com.liferay.document.library.kernel.model.DLFolder';

const SEARCH_API_URL = '/o/search/v1.0/search';

type Source = 'cms' | 'dl' | 'url';

/**
 * A Documents and Media scope: a site, Global or an asset library. "id" is
 * always the group id, which is what the search API filters by.
 */
type Site = {
	assetLibraryId?: number;
	id: number;
	kind: 'assetLibrary' | 'global' | 'site';
	name: string;
};

export interface UnifiedFile {
	id: number;
	mimeType?: string;
	raw: any;
	source: Source;
	title: string;
	url?: string;
}

/**
 * Liferay.Language.get returns the key itself when the module's language
 * resources don't include it (as in this PoC build).
 */
function getLabel(key: string, fallback: string) {
	const label = Liferay.Language.get(key);

	return label && label !== key ? label : fallback;
}

function toExtensionList(allowedExtensions?: string): string[] {
	return (allowedExtensions ?? '')
		.split(',')
		.map((extension) => extension.trim().replace(/^\./, ''))
		.filter(Boolean);
}

function buildSearchURL(params: Record<string, string>) {
	const url = new URL(SEARCH_API_URL, location.origin);

	url.search = new URLSearchParams({
		emptySearch: 'true',
		nestedFields: 'description,embedded,file.mimeType,file.thumbnailURL',
		...params,
	}).toString();

	return url.toString();
}

function buildCMSApiURL(extensions: string[], folderId: number | null) {
	const predicates = folderId
		? [`(folderId eq ${folderId})`]
		: [
				'(cmsRoot eq true)',
				"(cmsSection eq 'files')",
				'(rootDescendantNode eq false)',
			];

	predicates.push('(status in (0, 2, 3))');

	if (extensions.length) {
		predicates.push(
			`(extension in (${extensions.map((extension) => `'${extension}'`).join(',')}) or objectDefinitionExternalReferenceCode eq 'L_OBJECT_ENTRY_FOLDER')`
		);
	}

	return buildSearchURL({filter: predicates.join(' and ')});
}

function buildDLApiURL(
	extensions: string[],
	siteId: number,
	folderId: number | null
) {
	const predicates = [
		`(scopeGroupId eq ${siteId})`,
		`(folderId eq ${folderId ?? 0})`,
		'(status eq 0)',
	];

	// DLFolder documents have no extension field, so "extension eq null" keeps
	// the folders while the files are filtered by extension

	if (extensions.length) {
		predicates.push(
			`(extension in (${extensions.map((extension) => `'${extension}'`).join(',')}) or extension eq null)`
		);
	}

	return buildSearchURL({
		entryClassNames: [DL_FILE_ENTRY_CLASS_NAME, DL_FOLDER_CLASS_NAME].join(
			','
		),
		filter: predicates.join(' and '),
	});
}

function normalize(source: Source, item: any): UnifiedFile {
	const embedded = item?.embedded ?? {};

	if (source === 'cms') {
		return {
			id: embedded.id,
			mimeType: embedded.file?.mimeType,
			raw: item,
			source,
			title: embedded.title ?? item.title,
			url: embedded.file?.link?.href ?? embedded.videoURL,
		};
	}

	return {
		id: embedded.id,
		mimeType: embedded.encodingFormat,
		raw: item,
		source,
		title: embedded.title ?? item.title,
		url: embedded.contentUrl,
	};
}

function getStickerProps(mimeType: string) {
	return {
		className: mimeTypeUtils.getClassNameFromMimeType(mimeType),
		content: React.createElement(ClayIcon, {
			symbol: mimeTypeUtils.getIconFromMimeType(mimeType),
		}),
		displayType: 'unstyled',
	};
}

const VIEWS = [
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
			item: any;
			props: object;
		}) => {
			const embedded = item?.embedded ?? {};

			// Documents of an asset library come without a top-level title
			// (the library's default language may differ), and DL folders only
			// have a name

			const props = {
				...initialProps,
				title:
					(initialProps as {title?: string}).title ||
					item?.title ||
					embedded.title ||
					embedded.name ||
					'',
			};

			if (embedded.file) {
				const mimeType = embedded.file.mimeType || '';

				return {
					...props,
					imgProps: {src: embedded.file.thumbnailURL},
					stickerProps: getStickerProps(mimeType),
				};
			}

			if (embedded.contentUrl) {
				const mimeType = embedded.encodingFormat || '';

				return {
					...props,
					imgProps: mimeType.startsWith('image/')
						? {src: embedded.contentUrl}
						: undefined,
					stickerProps: getStickerProps(mimeType),
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
];

function SourceSwitcher({
	onSiteChange,
	onSourceChange,
	siteId,
	sites,
	source,
}: {
	onSiteChange: (siteId: number) => void;
	onSourceChange: (source: Source) => void;
	siteId: number | null;
	sites: Site[];
	source: Source;
}) {
	return (
		<div className="align-items-center border-bottom d-flex px-4 py-2">
			<ClayButton.Group className="mr-3">
				<ClayButton
					aria-pressed={source === 'cms'}
					displayType={source === 'cms' ? 'primary' : 'secondary'}
					onClick={() => onSourceChange('cms')}
					size="sm"
				>
					Spaces (CMS)
				</ClayButton>

				<ClayButton
					aria-pressed={source === 'dl'}
					displayType={source === 'dl' ? 'primary' : 'secondary'}
					onClick={() => onSourceChange('dl')}
					size="sm"
				>
					{getLabel('documents-and-media', 'Documents and Media')}
				</ClayButton>

				<ClayButton
					aria-pressed={source === 'url'}
					displayType={source === 'url' ? 'primary' : 'secondary'}
					onClick={() => onSourceChange('url')}
					size="sm"
				>
					URL
				</ClayButton>
			</ClayButton.Group>

			{source === 'dl' && (
				<ClaySelect
					aria-label={getLabel('site', 'Site')}
					className="w-auto"
					onChange={(event) =>
						onSiteChange(Number(event.target.value))
					}
					sizing="sm"
					value={siteId ?? ''}
				>
					<optgroup label={getLabel('sites', 'Sites')}>
						{sites
							.filter((site) => site.kind !== 'assetLibrary')
							.map((site) => (
								<ClaySelect.Option
									key={site.id}
									label={site.name}
									value={site.id}
								/>
							))}
					</optgroup>

					{sites.some((site) => site.kind === 'assetLibrary') && (
						<optgroup
							label={getLabel('asset-libraries', 'Asset Libraries')}
						>
							{sites
								.filter((site) => site.kind === 'assetLibrary')
								.map((site) => (
									<ClaySelect.Option
										key={site.id}
										label={site.name}
										value={site.id}
									/>
								))}
						</optgroup>
					)}
				</ClaySelect>
			)}
		</div>
	);
}

async function fetchJSON(url: string) {
	try {
		const response = await fetch(url);

		return response.ok ? await response.json() : null;
	}
	catch (error) {
		console.error(error);

		return null;
	}
}

/**
 * Sites of the user (by their descriptive name, not the group name, which is
 * "Guest" for the default site), Global and the asset libraries. CMS Spaces
 * and Design Libraries are left out: Spaces have their own source.
 */
async function fetchSites(): Promise<Site[]> {
	const companyGroupId = Number(Liferay.ThemeDisplay.getCompanyGroupId());

	const sites: Site[] = [];

	const userAccount = await fetchJSON(
		'/o/headless-admin-user/v1.0/my-user-account'
	);

	const siteBriefs: Array<{id: number; name: string}> = (
		userAccount?.siteBriefs ?? []
	).filter((siteBrief: {id: number}) => siteBrief.id !== companyGroupId);

	const siteDetails = await Promise.all(
		siteBriefs.map((siteBrief) =>
			fetchJSON(`/o/headless-admin-user/v1.0/sites/${siteBrief.id}`)
		)
	);

	siteBriefs.forEach((siteBrief, index) => {
		sites.push({
			id: siteBrief.id,
			kind: 'site',
			name: siteDetails[index]?.descriptiveName || siteBrief.name,
		});
	});

	sites.push({
		id: companyGroupId,
		kind: 'global',
		name: getLabel('global', 'Global'),
	});

	const assetLibraries = await fetchJSON(
		"/o/headless-asset-library/v1.0/asset-libraries?filter=type eq 'AssetLibrary'&pageSize=100"
	);

	for (const assetLibrary of assetLibraries?.items ?? []) {
		if (assetLibrary.type !== 'AssetLibrary') {
			continue;
		}

		sites.push({
			assetLibraryId: assetLibrary.id,
			id: assetLibrary.siteId,
			kind: 'assetLibrary',
			name: assetLibrary.name,
		});
	}

	return sites;
}

/**
 * Uploads to the Documents and Media of the selected site, in the folder the
 * selector is showing (the CMS modal passes it as parentObjectEntryFolderId).
 */
function DLFileUploaderComponent({
	allowedExtensions,
	files,
	maxFileSize,
	onCloseUploadView,
	parentObjectEntryFolderId,
	site,
}: {
	allowedExtensions?: string;
	files: FileData[];
	maxFileSize?: number;
	onCloseUploadView: () => void;
	parentObjectEntryFolderId?: number | null;
	site: Site;
}) {
	const uploadRequest: UploadRequestCallback = async ({fileData}) => {
		const formData = new FormData();

		formData.append('file', fileData.file, fileData.name);
		formData.append('document', JSON.stringify({title: fileData.name}));

		let url = `/o/headless-delivery/v1.0/sites/${site.id}/documents`;

		if (parentObjectEntryFolderId) {
			url = `/o/headless-delivery/v1.0/document-folders/${parentObjectEntryFolderId}/documents`;
		}
		else if (site.assetLibraryId) {
			url = `/o/headless-delivery/v1.0/asset-libraries/${site.assetLibraryId}/documents`;
		}

		const response = await Liferay.Util.fetch(url, {
			body: formData,
			method: 'POST',
		});

		if (!response.ok) {
			throw new Error(`Upload failed with status ${response.status}`);
		}

		return await response.json();
	};

	return (
		<MultipleFileUploader
			filesToUpload={files}
			maxFileSize={maxFileSize}
			onModalClose={onCloseUploadView}
			onUploadComplete={({failedFiles}: {failedFiles: string[]}) => {
				if (!failedFiles.length) {
					onCloseUploadView();
				}
			}}
			uploadRequest={uploadRequest}
			validExtensions={allowedExtensions}
		/>
	);
}

/**
 * Same as the URL tab of the legacy selector: the URL is used as it is.
 */
function URLSelector({onSelect}: {onSelect: (url: string) => void}) {
	const [url, setURL] = useState('');
	const [previewError, setPreviewError] = useState(false);

	const isValid = /^(https?:)?\/\/|^\//.test(url.trim());

	return (
		<div className="px-2 py-3">
			<label htmlFor="unifiedItemSelectorURL">URL</label>

			<ClayInput.Group>
				<ClayInput.GroupItem>
					<ClayInput
						id="unifiedItemSelectorURL"
						onChange={(event) => {
							setURL(event.target.value);
							setPreviewError(false);
						}}
						onKeyDown={(event) => {
							if (event.key === 'Enter' && isValid) {
								onSelect(url.trim());
							}
						}}
						placeholder="https://"
						type="text"
						value={url}
					/>
				</ClayInput.GroupItem>

				<ClayInput.GroupItem shrink>
					<ClayButton
						disabled={!isValid}
						onClick={() => onSelect(url.trim())}
					>
						{getLabel('select', 'Select')}
					</ClayButton>
				</ClayInput.GroupItem>
			</ClayInput.Group>

			{isValid && !previewError && (
				<div className="mt-4 text-center">
					<img
						alt=""
						onError={() => setPreviewError(true)}
						src={url.trim()}
						style={{maxHeight: '320px', maxWidth: '100%'}}
					/>
				</div>
			)}

			{isValid && previewError && (
				<p className="mt-3 text-secondary">
					{getLabel(
						'the-image-could-not-be-loaded',
						'The image could not be loaded.'
					)}
				</p>
			)}
		</div>
	);
}

function DetachedUnifiedFilesItemSelectorModal({
	allowDragAndDrop,
	allowedExtensions,
	groupId,
	initialSiteId,
	initialSource,
	itemTypeLabel,
	onSelect,
	uploadGroupId,
}: {
	allowDragAndDrop: boolean;
	allowedExtensions?: string;
	groupId: number;
	initialSiteId?: number;
	initialSource: Source;
	itemTypeLabel?: string;
	onSelect: (items: UnifiedFile[]) => void;
	uploadGroupId?: number;
}) {
	const [source, setSource] = useState<Source>(initialSource);
	const [sites, setSites] = useState<Site[]>([]);
	const [siteId, setSiteId] = useState<number | null>(initialSiteId ?? null);
	const [closed, setClosed] = useState(false);

	useEffect(() => {
		fetchSites().then((fetchedSites) => {
			setSites(fetchedSites);

			setSiteId(
				(currentSiteId) =>
					currentSiteId ??
					fetchedSites.find((site) => site.kind === 'site')?.id ??
					fetchedSites[0]?.id ??
					null
			);
		});
	}, []);

	const site = sites.find((site) => site.id === siteId);

	const extensions = useMemo(
		() => toExtensionList(allowedExtensions),
		[allowedExtensions]
	);

	const buildApiURL = useCallback(
		(folderId: number | null) =>
			source === 'cms' || siteId === null
				? buildCMSApiURL(extensions, folderId)
				: buildDLApiURL(extensions, siteId, folderId),
		[extensions, siteId, source]
	);

	// Both sources get a real uploader: the data set keeps the "Upload Files"
	// button it was created with, so it must work for whichever source is
	// active when it is clicked

	const dlFileUploaderComponent = useMemo(
		() =>
			site
				? (props: any) => (
						<DLFileUploaderComponent {...props} site={site} />
					)
				: undefined,
		[site]
	);

	const filesUploaderComponent = allowDragAndDrop
		? source === 'cms'
			? CMSFileUploaderComponent
			: dlFileUploaderComponent
		: undefined;

	const fdsProps = useMemo(
		() => ({
			configInURLBehavior: EConfigInURLBehavior.OFF,
			filters: source === 'cms' ? getCMSItemSelectorFilters(groupId) : [],
			groupedFilters:
				source === 'cms' ? getCMSItemSelectorGroupedFilters() : [],
			hideManagementBarInEmptyState: true,
			id: `UnifiedItemSelectorFDS_${source}_${siteId ?? 0}`,
			pagination: {
				deltas: [{label: 20}, {label: 40}, {label: 60}],
				initialDelta: 20,
			},
			views: VIEWS,
		}),
		[groupId, siteId, source]
	);

	if (closed) {
		return null;
	}

	return (
		<DetachedCMSFilesItemSelectorModal
			allowedExtensions={allowedExtensions}
			apiURL={buildApiURL(null)}
			buildApiURL={buildApiURL}
			customBody={
				source === 'url' ? (
					<URLSelector
						onSelect={(url) => {
							onSelect([
								{
									id: 0,
									raw: {url},
									source: 'url',
									title: '',
									url,
								},
							]);

							setClosed(true);
						}}
					/>
				) : undefined
			}
			fdsProps={fdsProps as any}
			filesUploaderComponent={filesUploaderComponent as any}
			groupId={source === 'cms' ? uploadGroupId : undefined}
			itemTypeLabel={itemTypeLabel ?? getLabel('files', 'Files')}
			items={[]}
			locator={{
				id: 'embedded.id',
				label: 'embedded.title',
				value: 'embedded.id',
			}}
			message={
				<SourceSwitcher
					onSiteChange={setSiteId}
					onSourceChange={setSource}
					siteId={siteId}
					sites={sites}
					source={source}
				/>
			}
			onItemsChange={(items: any[]) =>
				onSelect(items.map((item) => normalize(source, item)))
			}
			resetKey={`${source}_${siteId ?? 0}`}
			rootLabel={
				source === 'cms'
					? getLabel('files', 'Files')
					: getLabel('documents-and-media', 'Documents and Media')
			}
		/>
	);
}

export default function openUnifiedFileSelectorModal({
	allowDragAndDrop = false,
	allowedExtensions,
	containerId,
	groupId,
	initialSiteId,
	initialSource = 'cms',
	itemTypeLabel,
	onSelect,
	uploadGroupId,
}: {
	allowDragAndDrop?: boolean;
	allowedExtensions?: string;

	/**
	 * Id given to the modal's container while it is open. The Page Editor
	 * keeps the editor alive on blur when an element with the editor's
	 * itemSelectorEventName as id exists, as the legacy selector does.
	 */
	containerId?: string;


	/**
	 * Group used by the CMS filters (categories, tags).
	 */
	groupId: number;

	/**
	 * Site whose Documents and Media is shown first. Defaults to the first
	 * site of the user that is not Global.
	 */
	initialSiteId?: number;

	initialSource?: Source;
	itemTypeLabel?: string;
	onSelect: (items: UnifiedFile[]) => void;

	/**
	 * Space where CMS files are uploaded. Without it, the uploader asks for
	 * the Space.
	 */
	uploadGroupId?: number;
}) {
	const container = document.createElement('div');

	if (containerId) {
		container.id = containerId;

		document.body.appendChild(container);
	}

	return render(
		DetachedUnifiedFilesItemSelectorModal,
		{
			allowDragAndDrop,
			allowedExtensions,
			groupId,
			initialSiteId,
			initialSource,
			itemTypeLabel,
			onSelect: (items: UnifiedFile[]) => {
				onSelect(items);

				// Same as the legacy selector: the marker disappears once the
				// selection is done, so the editor can be blurred again

				container.removeAttribute('id');
			},
			uploadGroupId,
		},
		container
	);
}
