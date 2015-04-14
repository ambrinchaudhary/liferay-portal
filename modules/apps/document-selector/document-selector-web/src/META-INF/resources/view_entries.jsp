<%@ page
	import="com.liferay.portal.portletfilerepository.PortletFileRepositoryUtil" %>
<%@ page import="com.liferay.portal.model.Repository" %>

<%@ page
	import="com.liferay.portlet.blogs.service.BlogsEntryLocalServiceUtil" %>
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
String[] tabs1Names = DocumentSelectorUtil.getTabs1Names(request);

long groupId = ParamUtil.getLong(request, "groupId", scopeGroupId);

Folder folder = BlogsEntryLocalServiceUtil.addAttachmentsFolder(themeDisplay.getUserId(), groupId);

long folderId = folder.getFolderId();

String ckEditorFuncNum = DocumentSelectorUtil.getCKEditorFuncNum(request);
String eventName = ParamUtil.getString(request, "eventName");
boolean showGroupsSelector = ParamUtil.getBoolean(request, "showGroupsSelector");
String type = DocumentSelectorUtil.getType(request);

String displayStyle =(String)request.getAttribute("jsp-displayStyle");
String tabId =(String)request.getAttribute("jsp-tabId");
String tabName =(String)request.getAttribute("jsp-tabName");

String[] imageExtensions = PrefsPropsUtil.getStringArray(PropsKeys.BLOGS_IMAGE_EXTENSIONS, StringPool.COMMA); // TODO must be a new property

PortletURL iteratorURL = renderResponse.createRenderURL();

iteratorURL.setParameter("mvcPath", "/view.jsp");
iteratorURL.setParameter("tabs1Names", StringUtil.merge(tabs1Names));
iteratorURL.setParameter("groupId", String.valueOf(groupId));
iteratorURL.setParameter("folderId", String.valueOf(folderId));
iteratorURL.setParameter("ckEditorFuncNum", ckEditorFuncNum);
iteratorURL.setParameter("eventName", eventName);
iteratorURL.setParameter("showGroupsSelector", String.valueOf(showGroupsSelector));
iteratorURL.setParameter("type", type);

SearchContainer dlSearchContainer = new SearchContainer(liferayPortletRequest, null, null, "curEntry", SearchContainer.DEFAULT_DELTA, iteratorURL, null, null);

String orderByCol = GetterUtil.getString((String)request.getAttribute("orderByCol"));
String orderByType = GetterUtil.getString((String)request.getAttribute("orderByType"));

OrderByComparator<?> orderByComparator = DLUtil.getRepositoryModelOrderByComparator(orderByCol, orderByType);

dlSearchContainer.setOrderByCol(orderByCol);
dlSearchContainer.setOrderByComparator(orderByComparator);
dlSearchContainer.setOrderByType(orderByType);

dlSearchContainer.setTotal(PortletFileRepositoryUtil.getPortletFileEntriesCount(scopeGroupId, folderId));
dlSearchContainer.setResults(PortletFileRepositoryUtil.getPortletFileEntries(scopeGroupId, folderId));
%>

<div class="image-selector-container style-<%= displayStyle %>" id="<%= tabId %>ImageSelectorContainer">

	<!-- TODO -->
	<portlet:actionURL var="coverImageSelectorURL">
		<portlet:param name="struts_action" value="/blogs/cover_image_selector" />
	</portlet:actionURL>

	<c:choose>
	<c:when test='<%= !displayStyle.equals("icon") %>'>
	<div class="drop-zone">
		</c:when>

		<c:otherwise>
		<div class="col-md-3 preview-content drop-zone">
			</c:otherwise>
			</c:choose>

			<liferay-ui:image-selector draggableImage="vertical" fileEntryId="<%= 0 %>" maxFileSize="<%= PrefsPropsUtil.getLong(PropsKeys.BLOGS_IMAGE_COVER_MAX_SIZE) %>" paramName="blogImageFileEntry" uploadURL="<%= coverImageSelectorURL %>" validExtensions='<%= StringUtil.merge(imageExtensions, ", ") %>' />
		</div>

	<c:choose>
		<c:when test='<%= !displayStyle.equals("list") %>'>

			<%
			for (Object result : dlSearchContainer.getResults()) {
				FileEntry fileEntry = (FileEntry)result;

				String imageURL = DLUtil.getImagePreviewURL(fileEntry, themeDisplay);
				String imageTitle = DLUtil.getTitleWithExtension(fileEntry);

				FileVersion latestFileVersion = fileEntry.getLatestFileVersion();
			%>

				<c:choose>
					<c:when test='<%= displayStyle.equals("icon") %>'>
						<%@ include file="/META-INF/resources/view_entry_icon.jspf" %>
					</c:when>
					<c:otherwise>
						<%@ include file="/META-INF/resources/view_entry_descriptive.jspf" %>
					</c:otherwise>
				</c:choose>

			<%
			}
			%>

		</c:when>
		<c:otherwise>
			<%@ include file="/META-INF/resources/view_entry_list.jspf" %>
		</c:otherwise>
	</c:choose>

	<liferay-ui:search-paginator searchContainer="<%= dlSearchContainer %>" />
</div>
<div id="<%= tabId %>ImageViewerPreview" class="lfr-image-viewer"></div>

<aui:script use="liferay-image-viewer">
	var viewer = new Liferay.ImageViewer(
		{
			btnCloseCaption:'<%= tabName %>',
			captionFromTitle: true,
			centered: true,
			circular: true,
			links: '#<%= tabId %>ImageSelectorContainer a.image-preview',
			playing: false,
			preloadAllImages: false,
			preloadNeighborImages: true,
			infoTemplate: '{current} of {total}',
			showPlayer: false,
			zIndex: 1
		}
	).render('#<%= tabId %>ImageViewerPreview');
</aui:script>