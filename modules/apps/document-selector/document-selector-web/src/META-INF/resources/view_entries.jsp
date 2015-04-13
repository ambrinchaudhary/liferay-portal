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

long repositoryId = groupId;

Folder folder = (Folder)request.getAttribute(WebKeys.DOCUMENT_LIBRARY_FOLDER);

long folderId = BeanParamUtil.getLong(folder, request, "folderId", DLFolderConstants.DEFAULT_PARENT_FOLDER_ID);

if ((folder != null) && (folder.getGroupId() != groupId)) {
	folder = null;

	folderId = 0;
}

if (folderId > 0) {
	folder = DLAppServiceUtil.getFolder(folderId);
}

if (folder != null) {
	repositoryId = folder.getRepositoryId();
}

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

	<c:if test='<%= displayStyle.equals("list") %>'>
		<table class="table table-bordered">
			<thead class="table-columns">
			<tr>
				<th class="table-header">
					<liferay-ui:message key="name" />
				</th>
				<th class="table-header">
					<liferay-ui:message key="size" />
				</th>
				<th class="table-header">
					<liferay-ui:message key="status" />
				</th>
				<th class="table-header">
					<liferay-ui:message key="modified-date" />
				</th>
			<tr>
			</thead>
	</c:if>

	<liferay-ui:search-container
		emptyResultsMessage="there-are-no-documents-in-this-folder"
		iteratorURL="<%= iteratorURL %>"
	>

		<%
			String keywords = ParamUtil.getString(request, "keywords");

			if (Validator.isNotNull(keywords)) {
				SearchContext searchContext = SearchContextFactory.getInstance(request);

				searchContext.setAttribute("groupId", groupId);
				searchContext.setAttribute("mimeTypes", DocumentSelectorUtil.getMimeTypes(request));
				searchContext.setAttribute("paginationType", "regular");

				int entryEnd = ParamUtil.getInteger(request, "entryEnd", GetterUtil.getInteger(PropsUtil.get(PropsKeys.SEARCH_CONTAINER_PAGE_DEFAULT_DELTA), 20));

				searchContext.setEnd(entryEnd);

				searchContext.setFolderIds(new long[]{folderId});
				searchContext.setGroupIds(new long[]{groupId});
				searchContext.setIncludeFolders(false);

				searchContext.setKeywords(keywords);

				searchContext.setScopeStrict(false);

				int entryStart = ParamUtil.getInteger(request, "entryStart");

				searchContext.setStart(entryStart);

				Hits hits = DLAppServiceUtil.search(repositoryId, searchContext);

				searchContainer.setTotal(hits.getLength());

				searchContainer.setResults(DLUtil.getFileEntries(hits));
			}
			else {
				String[] mimeTypes = DocumentSelectorUtil.getMimeTypes(request);

				searchContainer.setTotal(DLAppServiceUtil.getFileEntriesCount(repositoryId, folderId, mimeTypes));

				searchContainer.setResults(DLAppServiceUtil.getFileEntries(repositoryId, folderId, mimeTypes, searchContainer.getStart(), searchContainer.getEnd(), searchContainer.getOrderByComparator()));
			}
		%>

		<liferay-ui:search-container-row
			className="com.liferay.portal.kernel.repository.model.FileEntry"
			keyProperty="fileEntryId"
			modelVar="fileEntry"
		>

			<%
			request.setAttribute("blog_images.jsp-fileEntry", fileEntry);

			String jspPage = "/view_entry_" + displayStyle + ".jsp";
			%>

			<liferay-util:include page="<%= jspPage %>" servletContext="<%= application %>" />

		</liferay-ui:search-container-row>

	</liferay-ui:search-container>

	<c:if test='<%= displayStyle.equals("list") %>'>
		</table>
	</c:if>
</div>

<div id="<%= tabId %>ImageViewerPreview"></div>

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
			showPlayer: false
		}
	).render('#<%= tabId %>ImageViewerPreview');
</aui:script>