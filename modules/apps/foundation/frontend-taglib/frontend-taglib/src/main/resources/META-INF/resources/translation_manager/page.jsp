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

<%@ include file="/translation_manager/init.jsp" %>

<%
Set<Locale> locales = LanguageUtil.getAvailableLocales(themeDisplay.getSiteGroupId());
%>

<c:if test="<%= initialize %>">
	<%
	JSONObject localesJSON = JSONFactoryUtil.createJSONObject();
	JSONArray availableLocalesArray = JSONFactoryUtil.createJSONArray();

	for (Locale curLocale : locales) {
		JSONObject localeJSON = JSONFactoryUtil.createJSONObject();

		localeJSON.put("icon", LocaleUtil.toW3cLanguageId(curLocale).toLowerCase());
		localeJSON.put("id", LocaleUtil.toLanguageId(curLocale));
		localeJSON.put("code", LocaleUtil.toW3cLanguageId(curLocale));
		localeJSON.put("name", curLocale.getDisplayName(locale));

		if (ArrayUtil.contains(availableLocales, curLocale)) {
			availableLocalesArray.put(LocaleUtil.toLanguageId(curLocale));
		}

		localesJSON.put(LocaleUtil.toLanguageId(curLocale), localeJSON);
	}
	%>

	<%
	SoyContext context = new SoyContext();
	context.put("availableLocales", availableLocalesArray);
	context.put("changeableDefaultLanguage", changeableDefaultLanguage);
	context.put("defaultLocale", defaultLanguageId);
	context.put("elementClasses", cssClass);
	context.put("id", namespace + id);
	context.put("locales", localesJSON);
	context.put("pathThemeImages", themeDisplay.getPathThemeImages());
	%>

	<div class="lfr-translationmanager-container">
		<soy:template-renderer
			context="<%= context %>"
			module="frontend-taglib/translation_manager/TranslationManager.es"
			templateNamespace="TranslationManager.render"
		/>
	</div>
</c:if>