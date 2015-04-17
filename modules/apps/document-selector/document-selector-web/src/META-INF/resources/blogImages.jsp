<%@ page import="com.liferay.portlet.blogs.util.BlogsConstants" %>
<%--
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
--%>

<%@ include file="/init.jsp" %>

<%
long groupId = ParamUtil.getLong(request, "groupId", scopeGroupId);

String displayStyle = ParamUtil.getString(request, "displayStyle");

if (Validator.isNull(displayStyle)) {
	displayStyle = "icon";
}

String eventName = ParamUtil.getString(request, "eventName");
boolean showGroupsSelector = ParamUtil.getBoolean(request, "showGroupsSelector");

long blogsFolderId = ParamUtil.getLong(request, "blogsFolderId");

if (blogsFolderId == 0) {
	Folder folder = BlogsEntryLocalServiceUtil.addAttachmentsFolder(themeDisplay.getUserId(), groupId);

	blogsFolderId = folder.getFolderId();
}
%>

<aui:form method="post" name="selectDocumentFm">

	<%
	PortletURL imageSelectorStyleIconURL = PortletURLUtil.clone(currentURLObj, liferayPortletResponse);
		imageSelectorStyleIconURL.setParameter("tabs1", "blogImages");
		imageSelectorStyleIconURL.setParameter("displayStyle", "icon");

	PortletURL imageSelectorStyleListURL = PortletURLUtil.clone(currentURLObj, liferayPortletResponse);
		imageSelectorStyleListURL.setParameter("tabs1", "blogImages");
		imageSelectorStyleListURL.setParameter("displayStyle", "list");

	PortletURL imageSelectorStyleIDescriptionURL = PortletURLUtil.clone(currentURLObj, liferayPortletResponse);
		imageSelectorStyleIDescriptionURL.setParameter("tabs1", "blogImages");
		imageSelectorStyleIDescriptionURL.setParameter("displayStyle", "description");
	%>

	<aui:nav-bar>
		<aui:nav collapsible="<%= true %>" cssClass="nav-display-style-buttons navbar-nav" icon="th-list" id="displayStyleButtons">
			<aui:nav-item
				href="<%= imageSelectorStyleIconURL.toString() %>"
				iconCssClass="icon-th-large"
			/>
			<aui:nav-item
				href="<%= imageSelectorStyleIDescriptionURL.toString() %>"
				iconCssClass="icon-th-list"
			/>
			<aui:nav-item
				href="<%= imageSelectorStyleListURL.toString() %>"
				iconCssClass="icon-align-justify"
			/>
		</aui:nav>
	</aui:nav-bar>

	<%
	String[] tabs1Names = DocumentSelectorUtil.getTabs1Names(request);

	PortletURL iteratorURL = renderResponse.createRenderURL(); // TODO

	iteratorURL.setParameter("mvcPath", "/view.jsp");
	iteratorURL.setParameter("tabs1", "blogImages");
	iteratorURL.setParameter("displayStyle", displayStyle);
	iteratorURL.setParameter("tabs1Names", StringUtil.merge(tabs1Names));
	iteratorURL.setParameter("groupId", String.valueOf(groupId));
	iteratorURL.setParameter("blogsFolderId", String.valueOf(blogsFolderId));
	iteratorURL.setParameter("ckEditorFuncNum", DocumentSelectorUtil.getType(request));
	iteratorURL.setParameter("eventName", eventName);
	iteratorURL.setParameter("showGroupsSelector", String.valueOf(showGroupsSelector));
	iteratorURL.setParameter("type", DocumentSelectorUtil.getType(request));

	SearchContainer blogsImageSearchContainer = new SearchContainer(renderRequest, null, null, "curBlogsImage", SearchContainer.DEFAULT_DELTA, iteratorURL, null, null);

	blogsImageSearchContainer.setTotal(PortletFileRepositoryUtil.getPortletFileEntriesCount(scopeGroupId, blogsFolderId));
	blogsImageSearchContainer.setResults(PortletFileRepositoryUtil.getPortletFileEntries(scopeGroupId, blogsFolderId, WorkflowConstants.STATUS_APPROVED, blogsImageSearchContainer.getStart(), blogsImageSearchContainer.getEnd(), blogsImageSearchContainer.getOrderByComparator()));
	%>

	<document-selector-ui:item-browser
		displayStyle="<%= displayStyle %>"
		idPrefix="blogImages"
		itemSearchContainer="<%= blogsImageSearchContainer %>"
		tabName="Blog images"
	/>

</aui:form>