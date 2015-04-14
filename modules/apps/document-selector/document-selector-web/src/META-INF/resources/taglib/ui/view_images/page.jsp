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

<%@ include file="/taglib/ui/view_images/init.jsp" %>

<%
String displayStyle = GetterUtil.getString(request.getAttribute("document-selector:view-entries:displayStyle"), "icon");
String idPrefix = GetterUtil.getString(request.getAttribute("document-selector:view-entries:idPrefix"));
String tabName = GetterUtil.getString(request.getAttribute("document-selector:view-entries:tabName"));
SearchContainer imageSearchContainer = (SearchContainer)request.getAttribute("document-selector:view-entries:imageSearchContainer");
String uploadURL = GetterUtil.getString(request.getAttribute("document-selector:view-entries:uploadURL"));

String[] imageExtensions = PrefsPropsUtil.getStringArray(PropsKeys.BLOGS_IMAGE_EXTENSIONS, StringPool.COMMA); // TODO must be a new property

String orderByCol = GetterUtil.getString((String) request.getAttribute("orderByCol"));
String orderByType = GetterUtil.getString((String)request.getAttribute("orderByType"));

OrderByComparator<?> orderByComparator = DLUtil.getRepositoryModelOrderByComparator(orderByCol, orderByType);

imageSearchContainer.setOrderByCol(orderByCol);
imageSearchContainer.setOrderByComparator(orderByComparator);
imageSearchContainer.setOrderByType(orderByType);
%>

<div class="image-selector-container style-<%= displayStyle %>" id="<%= idPrefix %>ImageSelectorContainer">

	<c:choose>
		<c:when test='<%= !displayStyle.equals("icon") %>'>
			<div class="drop-zone">
		</c:when>
		<c:otherwise>
		<div class="col-md-3 preview-content drop-zone">
			</c:otherwise>
	</c:choose>

		<liferay-ui:image-selector draggableImage="vertical" fileEntryId="<%= 0 %>" maxFileSize="<%= PrefsPropsUtil.getLong(PropsKeys.BLOGS_IMAGE_COVER_MAX_SIZE) %>" paramName="blogImageFileEntry" uploadURL="<%= uploadURL %>" validExtensions='<%= StringUtil.merge(imageExtensions, ", ") %>' />
	</div>

	<c:choose>
		<c:when test='<%= !displayStyle.equals("list") %>'>

			<%
			for (Object result : imageSearchContainer.getResults()) {
				FileEntry fileEntry = (FileEntry)result;

				String imageURL = DLUtil.getImagePreviewURL(fileEntry, themeDisplay);
				String imageTitle = DLUtil.getTitleWithExtension(fileEntry);

				FileVersion latestFileVersion = fileEntry.getLatestFileVersion();
			%>

				<c:choose>
					<c:when test='<%= displayStyle.equals("icon") %>'>
						<%@ include file="/META-INF/resources/taglib/ui/view_images/view_entry_icon.jspf" %>
					</c:when>
					<c:otherwise>
						<%@ include file="/META-INF/resources/taglib/ui/view_images/view_entry_descriptive.jspf" %>
					</c:otherwise>
				</c:choose>

			<%
			}
			%>

		</c:when>
		<c:otherwise>
			<%@ include file="/META-INF/resources/taglib/ui/view_images/view_entry_list.jspf" %>
		</c:otherwise>
	</c:choose>

	<liferay-ui:search-paginator searchContainer="<%= imageSearchContainer %>" />
</div>

<div class="lfr-image-viewer" id="<%= idPrefix %>ImageViewerPreview"></div>

<aui:script use="liferay-image-viewer">
	var viewer = new Liferay.ImageViewer(
		{
			btnCloseCaption:'<%= tabName %>',
			captionFromTitle: true,
			centered: true,
			circular: true,
			links: '#<%= idPrefix %>ImageSelectorContainer a.image-preview',
			playing: false,
			preloadAllImages: false,
			preloadNeighborImages: true,
			infoTemplate: '{current} of {total}',
			showPlayer: false,
			zIndex: 1
		}
	).render('#<%= idPrefix %>ImageViewerPreview');
</aui:script>