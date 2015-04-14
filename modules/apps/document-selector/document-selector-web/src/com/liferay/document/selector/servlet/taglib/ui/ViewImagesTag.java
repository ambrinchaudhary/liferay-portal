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

package com.liferay.document.selector.servlet.taglib.ui;

import com.liferay.portal.kernel.dao.search.SearchContainer;
import com.liferay.taglib.util.IncludeTag;

import javax.servlet.http.HttpServletRequest;

/**
 * @author Roberto Díaz
 */
public class ViewImagesTag extends IncludeTag {

	public void setDisplayStyle(String displayStyle) {
		_displayStyle = displayStyle;
	}

	public void setIdPrefix(String idPrefix) {
		_idPrefix = idPrefix;
	}

	public void setImageSearchContainer(SearchContainer imageSearchContainer) {
		_imageSearchContainer = imageSearchContainer;
	}

	public void setUploadURL(String uploadURL) {
		_uploadURL = uploadURL;
	}

	public void setTabName(String tabName) {
		_tabName = tabName;
	}

	@Override
	protected void cleanUp() {
		super.cleanUp();

		_displayStyle = "icon";
		_idPrefix = null;
		_imageSearchContainer = null;
		_tabName = null;
		_uploadURL = null;
	}

	@Override
	protected String getPage() {
		return _PAGE;
	}

	@Override
	protected void setAttributes(HttpServletRequest request) {
		request.setAttribute(
			"document-selector:view-entries:displayStyle", _displayStyle);
		request.setAttribute(
			"document-selector:view-entries:idPrefix", _idPrefix);
		request.setAttribute(
			"document-selector:view-entries:imageSearchContainer",
			_imageSearchContainer);
		request.setAttribute(
			"document-selector:view-entries:tabName", _tabName);
		request.setAttribute(
			"document-selector:view-entries:uploadURL", _uploadURL);
	}

	private static final String _PAGE = "/taglib/ui/view_images/page.jsp";

	private String _displayStyle;
	private String _idPrefix;
	private SearchContainer _imageSearchContainer;
	private String _tabName;
	private String _uploadURL;

}