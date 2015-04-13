<%@ include file="/init.jsp" %>
<%@ page import="com.liferay.portlet.documentlibrary.util.DLImpl" %>

<%
FileEntry fileEntry = (FileEntry) request.getAttribute("blog_images.jsp-fileEntry");
FileVersion latestFileVersion = fileEntry.getLatestFileVersion();

String previewURL = DLUtil.getImagePreviewURL(fileEntry, themeDisplay);
String thumbnailSrc = DLUtil.getPreviewURL(fileEntry, fileEntry.getLatestFileVersion(), themeDisplay, "&imageThumbnail=2");
String imageTitle = DLUtil.getTitleWithExtension(fileEntry);

String author = fileEntry.getUserName();
Integer status = latestFileVersion.getStatus();
%>

<div class="col-md-3 preview-content">
	<a href="<%= previewURL %>" class="image-preview" title="<%= imageTitle %>">
		<img align="left" alt="" src="<%= thumbnailSrc %>"/>
		<div class="image-info hide">
			<dl>
				<dt><liferay-ui:message key="format" /></dt>
				<dd>JPG</dd>

				<dt><liferay-ui:message key="size" /></dt>
				<dd><%= TextFormatter.formatStorageSize(fileEntry.getSize(), locale) %></dd>

				<dt><liferay-ui:message key="status" />:</dt>
				<dd><aui:workflow-status showIcon="<%= false %>" showLabel="<%= false %>" status="<%= status %>" /> </dd>

				<dt><liferay-ui:message key="modified" />:</dt>
				<dd><liferay-ui:message arguments="<%= new String[] {LanguageUtil.getTimeDescription(locale, System.currentTimeMillis() - fileEntry.getModifiedDate().getTime(), true), HtmlUtil.escape(author)} %>" key="x-ago-by-x" translateArguments="<%= false %>" /></dd>

			</dl>
		</div>
	</a>
</div>