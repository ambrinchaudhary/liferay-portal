<%@ include file="/init.jsp" %>

<%@ page import="com.liferay.portal.kernel.language.LanguageUtil" %>

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
		<a href="<%= imageURL %>" class="image-preview" title="<%= imageTitle %>">
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