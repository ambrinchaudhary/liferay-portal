/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	buildDLApiURL,
	buildSpacesApiURL,
} from '../../src/main/resources/META-INF/resources/utils/searchApiURL';

function decode(url: string) {
	return decodeURIComponent(url).replace(/\+/g, ' ');
}

describe('buildSpacesApiURL', () => {
	it('uses root predicates when no folderId is given', () => {
		const url = decode(buildSpacesApiURL({}));

		expect(url).toContain('(cmsRoot eq true)');
		expect(url).toContain("(cmsSection eq 'files')");
		expect(url).toContain('(rootDescendantNode eq false)');
		expect(url).not.toContain('folderId eq');
	});

	it('scopes to folderId when given', () => {
		const url = decode(buildSpacesApiURL({folderId: 42}));

		expect(url).toContain('(folderId eq 42)');
		expect(url).not.toContain('(cmsRoot eq true)');
	});

	it('includes extra filters', () => {
		const url = decode(
			buildSpacesApiURL({
				filters: ["(extension in ('mp4'))", '(videoURL ne null)'],
			})
		);

		expect(url).toContain("(extension in ('mp4'))");
		expect(url).toContain('(videoURL ne null)');
	});

	it('always adds the status filter', () => {
		const url = decode(buildSpacesApiURL({}));

		expect(url).toContain('(status in (0, 2, 3))');
	});
});

describe('buildDLApiURL', () => {
	it('filters by site and published status', () => {
		const url = decode(buildDLApiURL([], 123, null));

		expect(url).toContain('(scopeGroupId eq 123)');
		expect(url).toContain('(status eq 0)');
	});

	it('adds an extension predicate when extensions are given', () => {
		const url = decode(buildDLApiURL(['mp4', 'avi'], 123, null));

		expect(url).toContain("extension in ('mp4','avi')");
	});

	it('omits the extension predicate when no extensions are given', () => {
		const url = decode(buildDLApiURL([], 123, null));

		expect(url).not.toContain('extension in');
	});
});
