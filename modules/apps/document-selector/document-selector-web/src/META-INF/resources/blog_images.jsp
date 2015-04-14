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
%>

<aui:form method="post" name="selectDocumentFm">

	<%
	PortletURL imageSelectorStyleIconURL = PortletURLUtil.clone(currentURLObj, liferayPortletResponse);
	imageSelectorStyleIconURL.setParameter("displayStyle", "icon");

	PortletURL imageSelectorStyleListURL = PortletURLUtil.clone(currentURLObj, liferayPortletResponse);
	imageSelectorStyleListURL.setParameter("displayStyle", "list");

	PortletURL imageSelectorStyleIDescriptionURL = PortletURLUtil.clone(currentURLObj, liferayPortletResponse);
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

	long folderId = BlogsEntryLocalServiceUtil.addAttachmentsFolder(themeDisplay.getUserId(), groupId).getFolderId();

	PortletURL iteratorURL = renderResponse.createRenderURL(); // TODO

	iteratorURL.setParameter("mvcPath", "/view.jsp");
	iteratorURL.setParameter("tabs1Names", StringUtil.merge(tabs1Names));
	iteratorURL.setParameter("groupId", String.valueOf(groupId));
	iteratorURL.setParameter("folderId", String.valueOf(folderId));
	iteratorURL.setParameter("ckEditorFuncNum", DocumentSelectorUtil.getType(request));
	iteratorURL.setParameter("eventName", eventName);
	iteratorURL.setParameter("showGroupsSelector", String.valueOf(showGroupsSelector));
	iteratorURL.setParameter("type", DocumentSelectorUtil.getType(request));

	SearchContainer imageSearchContainer = new SearchContainer(renderRequest, null, null, "curEntry", SearchContainer.DEFAULT_DELTA, iteratorURL, null, null);

	imageSearchContainer.setTotal(PortletFileRepositoryUtil.getPortletFileEntriesCount(scopeGroupId, folderId));
	imageSearchContainer.setResults(PortletFileRepositoryUtil.getPortletFileEntries(scopeGroupId, folderId));
	%>

	<portlet:actionURL var="uploadURL">
		<portlet:param name="struts_action" value="/blogs/cover_image_selector" />
	</portlet:actionURL>

	<document-selector-ui:view-images
		displayStyle="<%= displayStyle %>"
		idPrefix="blogImages"
		imageSearchContainer="<%= imageSearchContainer %>"
		servletContext="<%= application %>"
		tabName="Blog images"
		uploadURL="<%= uploadURL %>"
	/>
</aui:form>