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

String eventName = ParamUtil.getString(request, "eventName");
boolean showGroupsSelector = ParamUtil.getBoolean(request, "showGroupsSelector");

String displayStyle = ParamUtil.getString(request, "displayStyle");

if (Validator.isNull(displayStyle)) {
	displayStyle = "icon";
}
%>

<aui:form method="post" name="selectDocumentFm">

	<liferay-portlet:renderURL portletName="<%= PortletKeys.DOCUMENT_SELECTOR %>" varImpl="documentSelectorURL" windowState="<%= LiferayWindowState.POP_UP.toString() %>">
		<portlet:param name="mvcPath" value="/view.jsp" />
		<portlet:param name="groupId" value="<%= String.valueOf(groupId) %>" />
		<portlet:param name="eventName" value="<%= eventName %>" />
		<portlet:param name="showGroupsSelector" value="<%= String.valueOf(showGroupsSelector) %>" />
	</liferay-portlet:renderURL>

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
		request.setAttribute("jsp-displayStyle", displayStyle);
		request.setAttribute("jsp-tabId", "blogImages"); // TODO pendiente de backend
		request.setAttribute("jsp-tabName", "Blog images"); // TODO pendiente de backend
	%>

	<liferay-util:include page="/view_entries.jsp" servletContext="<%= application %>" />
</aui:form>