<%@ include file="/init.jsp" %>
<%@ page import="com.liferay.portal.kernel.language.LanguageUtil" %>

<%
FileEntry fileEntry = (FileEntry) request.getAttribute("blog_images.jsp-fileEntry");
FileVersion latestFileVersion = fileEntry.getLatestFileVersion();

String imageURL = DLUtil.getImagePreviewURL(fileEntry, themeDisplay);
String thumbnailSrc = DLUtil.getThumbnailSrc(fileEntry, themeDisplay);
String imageTitle = DLUtil.getTitleWithExtension(fileEntry);

String fileEntryImage = DLUtil.getFileEntryImage(fileEntry, themeDisplay);

String author = fileEntry.getUserName();
Integer status = latestFileVersion.getStatus();
%>

<div class="list-content">

	<div class="thumbnail-container ">
		<img align="left" alt="" src="<%= thumbnailSrc %>"/>
	</div>
	<div>
		<p>
			<a href="<%= imageURL %>" class="image-preview" title="<%= imageTitle %>">
		 		<%= imageTitle %>
		 	</a>
		</p>
		<p>
			<small>
				<dl>
					<dt><liferay-ui:message key="status" />:</dt>
					<dd><aui:workflow-status showIcon="<%= false %>" showLabel="<%= false %>" status="<%= status %>" /> </dd>

					<dt><liferay-ui:message key="modified" />:</dt>
					<dd><liferay-ui:message arguments="<%= new String[] {LanguageUtil.getTimeDescription(locale, System.currentTimeMillis() - fileEntry.getModifiedDate().getTime(), true), HtmlUtil.escape(author)} %>" key="x-ago-by-x" translateArguments="<%= false %>" /></dd>

				</dl>
			</small>
		</p>
	</div>
</div>