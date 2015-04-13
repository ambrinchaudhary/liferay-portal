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
FileEntry fileEntry = (FileEntry) request.getAttribute("blog_images.jsp-fileEntry");
FileVersion latestFileVersion = fileEntry.getLatestFileVersion();

String imageURL = DLUtil.getImagePreviewURL(fileEntry, themeDisplay);
String imageTitle = DLUtil.getTitleWithExtension(fileEntry);
String iconCssClass = DLUtil.getFileIconCssClass(imageTitle.substring(imageTitle.lastIndexOf(".") + 1));

String author = fileEntry.getUserName();
Integer status = latestFileVersion.getStatus();
%>

<tr>
	<td class="table-cell text-left text-middle">
		<a class="image-preview" href="<%= imageURL %>" title="<%= imageTitle %>">
			<c:if test="<%= Validator.isNotNull(iconCssClass) %>">
				<i class="<%= iconCssClass %>"></i>
			</c:if>
			<span class="taglib-text">
				<%= imageTitle %>
			</span>
		</a>
	</td>

	<td class="table-cell text-left text-middle">
		<span>
			<%= TextFormatter.formatStorageSize(fileEntry.getSize(), locale) %>
		</span>
	</td>

	<td class="table-cell text-left text-middle">
		<span>
			<aui:workflow-status showIcon="<%= false %>" showLabel="<%= false %>" status="<%= status %>" />
		</span>
	</td>

	<td class="table-cell text-left text-middle">
		<span>
			<liferay-ui:message arguments="<%= new String[] {LanguageUtil.getTimeDescription(locale, System.currentTimeMillis() - fileEntry.getModifiedDate().getTime(), true), HtmlUtil.escape(author)} %>" key="x-ago-by-x" translateArguments="<%= false %>" />
		</span>
	</td>
</tr>