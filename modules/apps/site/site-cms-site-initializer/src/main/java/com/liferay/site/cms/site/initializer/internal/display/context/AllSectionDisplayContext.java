/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cms.site.initializer.internal.display.context;

import com.liferay.frontend.data.set.model.FDSActionDropdownItem;
import com.liferay.frontend.taglib.clay.servlet.taglib.util.DropdownItem;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.search.rest.dto.v1_0.SearchResult;
import com.liferay.portal.search.rest.resource.v1_0.SearchResultResource;
import com.liferay.portal.vulcan.pagination.Page;
import com.liferay.portal.vulcan.pagination.Pagination;
import com.liferay.portal.vulcan.util.UriInfoUtil;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

/**
 * @author Jürgen Kappler
 */
public class AllSectionDisplayContext {

	public AllSectionDisplayContext(
		HttpServletRequest httpServletRequest,
		SearchResultResource.Factory searchResultResourceFactory) {

		_httpServletRequest = httpServletRequest;
		_searchResultResourceFactory = searchResultResourceFactory;
	}

	public String getAPIURL() {
		return "/o/search/v1.0/search?emptySearch=true";
	}

	public List<DropdownItem> getBulkActionDropdownItems() {
		return new ArrayList<>();
	}

	public List<FDSActionDropdownItem> getFDSActionDropdownItems() {
		return new ArrayList<>();
	}

	public boolean isShowEmptyState() throws Exception {
		return true;
	}

	private final HttpServletRequest _httpServletRequest;
	private final SearchResultResource.Factory _searchResultResourceFactory;

}