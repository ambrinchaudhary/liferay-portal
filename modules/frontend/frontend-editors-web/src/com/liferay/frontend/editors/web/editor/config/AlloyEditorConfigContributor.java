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

package com.liferay.frontend.editors.web.editor.config;

import com.liferay.document.library.item.selector.web.DLItemSelectorCriterion;
import com.liferay.item.selector.ItemSelector;
import com.liferay.item.selector.ItemSelectorCriterion;
import com.liferay.portal.kernel.editor.config.BaseEditorConfigContributor;
import com.liferay.portal.kernel.editor.config.EditorConfigContributor;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.portlet.LiferayPortletResponse;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HtmlUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.theme.ThemeDisplay;
import com.liferay.portlet.documentlibrary.model.DLFolderConstants;

import java.net.URL;

import java.util.Locale;
import java.util.Map;

import javax.portlet.PortletURL;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Sergio González
 */
@Component(
	property = {"editor.name=alloyeditor"},
	service = EditorConfigContributor.class
)
public class AlloyEditorConfigContributor extends BaseEditorConfigContributor {

	@Override
	public void populateConfigJSONObject(
		JSONObject jsonObject, Map<String, Object> inputEditorTaglibAttributes,
		ThemeDisplay themeDisplay,
		LiferayPortletResponse liferayPortletResponse) {

		String contentsLanguageId = (String)inputEditorTaglibAttributes.get(
			"liferay-ui:input-editor:contentsLanguageId");

		Locale contentsLocale = LocaleUtil.fromLanguageId(contentsLanguageId);

		String contentsLanguageDir = LanguageUtil.get(
			contentsLocale, "lang.dir");

		contentsLanguageId = LocaleUtil.toLanguageId(contentsLocale);

		jsonObject.put(
			"contentsLangDirection", HtmlUtil.escapeJS(contentsLanguageDir));
		jsonObject.put(
			"contentsLanguage", contentsLanguageId.replace("iw_", "he_"));
		jsonObject.put(
			"extraPlugins",
			"autolink,dragresize,dropimages,placeholder,selectionregion," +
				"tableresize,tabletools,uicore");

		String languageId = LocaleUtil.toLanguageId(themeDisplay.getLocale());

		jsonObject.put("language", languageId.replace("iw_", "he_"));
		jsonObject.put(
			"removePlugins", "elementspath,link,liststyle,resize,toolbar");

		if (liferayPortletResponse != null) {
			String name =
				liferayPortletResponse.getNamespace() +
					GetterUtil.getString(
						(String)inputEditorTaglibAttributes.get(
							"liferay-ui:input-editor:name"));

			String eventName = name + "selectDocument";

			Map<String, String> fileBrowserParamsMap =
				(Map<String, String>)inputEditorTaglibAttributes.get(
					"liferay-ui:input-editor:fileBrowserParams");

			PortletURL documentItemSelectorURL = getDocumentItemSelectorURL(
				liferayPortletResponse, themeDisplay.getScopeGroupId(),
				eventName, fileBrowserParamsMap);

			PortletURL imageItemSelectorURL = getImageItemSelectorURL(
				liferayPortletResponse, themeDisplay.getScopeGroupId(),
				eventName, fileBrowserParamsMap);

			PortletURL flashItemSelectorURL = getFlashItemSelectorURL(
				liferayPortletResponse, themeDisplay.getScopeGroupId(),
				eventName, fileBrowserParamsMap);

			jsonObject.put(
				"filebrowserBrowseUrl", documentItemSelectorURL.toString());
			jsonObject.put(
				"filebrowserFlashBrowseUrl", flashItemSelectorURL.toString());
			jsonObject.put(
				"filebrowserImageBrowseLinkUrl",
				imageItemSelectorURL.toString());
			jsonObject.put(
				"filebrowserImageBrowseUrl", imageItemSelectorURL.toString());

			jsonObject.put("srcNode", name);
		}

		jsonObject.put("toolbars", getToolbarsJSONObject());
	}

	@Override
	public void populateOptionsJSONObject(
		JSONObject jsonObject, Map<String, Object> inputEditorTaglibAttributes,
		ThemeDisplay themeDisplay,
		LiferayPortletResponse liferayPortletResponse) {
	}

	@Reference
	public void setItemSelector(ItemSelector itemSelector) {
		_itemSelector = itemSelector;
	}

	protected PortletURL getDocumentItemSelectorURL(
		LiferayPortletResponse liferayPortletResponse, long groupId,
		String eventName, Map<String, String> fileBrowserParamsMap) {

		DLItemSelectorCriterion documentItemSelectorCriterion =
			new DLItemSelectorCriterion(
				DLFolderConstants.DEFAULT_PARENT_FOLDER_ID, groupId, null,
				new String[0]);

		return getPopulatedItemSelectorURL(
			liferayPortletResponse, eventName, fileBrowserParamsMap,
			documentItemSelectorCriterion);
	}

	protected PortletURL getFlashItemSelectorURL(
		LiferayPortletResponse liferayPortletResponse, long groupId,
		String eventName, Map<String, String> fileBrowserParamsMap) {

		DLItemSelectorCriterion flashItemSelectorCriterion =
			new DLItemSelectorCriterion(
				DLFolderConstants.DEFAULT_PARENT_FOLDER_ID, groupId, "flash",
				new String[0]);

		return getPopulatedItemSelectorURL(
			liferayPortletResponse, eventName, fileBrowserParamsMap,
			flashItemSelectorCriterion);
	}

	protected PortletURL getImageItemSelectorURL(
		LiferayPortletResponse liferayPortletResponse, long groupId,
		String eventName, Map<String, String> fileBrowserParamsMap) {

		DLItemSelectorCriterion imageItemSelectorCriterion =
			new DLItemSelectorCriterion(
				DLFolderConstants.DEFAULT_PARENT_FOLDER_ID, groupId, "images",
				new String[] {"image/bmp", "image/gif", "image/jpeg"});

		imageItemSelectorCriterion.setDesiredReturnTypes(URL.class);

		return getPopulatedItemSelectorURL(
			liferayPortletResponse, eventName, fileBrowserParamsMap,
			imageItemSelectorCriterion);
	}

	protected PortletURL getPopulatedItemSelectorURL(
		LiferayPortletResponse liferayPortletResponse, String eventName,
		Map<String, String> paramsMap,
		ItemSelectorCriterion... itemSelectorCriterion) {

		PortletURL itemSelectorURL = _itemSelector.getItemSelectorURL(
			liferayPortletResponse, eventName, itemSelectorCriterion);

		if (paramsMap != null) {
			for (Map.Entry<String, String> entry : paramsMap.entrySet()) {
				itemSelectorURL.setParameter(entry.getKey(), entry.getValue());
			}
		}

		return itemSelectorURL;
	}

	protected JSONObject getToolbarsAddJSONObject() {
		JSONObject jsonObject = JSONFactoryUtil.createJSONObject();

		jsonObject.put("buttons", toJSONArray("['image', 'table', 'hline']"));
		jsonObject.put("tabIndex", 2);

		return jsonObject;
	}

	protected JSONObject getToolbarsJSONObject() {
		JSONObject jsonObject = JSONFactoryUtil.createJSONObject();

		jsonObject.put("add", getToolbarsAddJSONObject());
		jsonObject.put("styles", getToolbarsStylesJSONObject());

		return jsonObject;
	}

	protected JSONObject getToolbarsStylesJSONObject() {
		JSONObject jsonObject = JSONFactoryUtil.createJSONObject();

		jsonObject.put("selections", getToolbarsStylesSelectionsJSONArray());
		jsonObject.put("tabIndex", 1);

		return jsonObject;
	}

	protected JSONObject getToolbarsStylesSelectionsImageJSONObject() {
		JSONObject jsonNObject = JSONFactoryUtil.createJSONObject();

		jsonNObject.put("buttons", toJSONArray("['imageLeft', 'imageRight']"));
		jsonNObject.put("name", "image");
		jsonNObject.put("test", "AlloyEditor.SelectionTest.image");

		return jsonNObject;
	}

	protected JSONArray getToolbarsStylesSelectionsJSONArray() {
		JSONArray jsonArray = JSONFactoryUtil.createJSONArray();

		jsonArray.put(getToolbarsStylesSelectionsLinkJSONObject());
		jsonArray.put(getToolbarsStylesSelectionsImageJSONObject());
		jsonArray.put(getToolbarsStylesSelectionsTextJSONObject());
		jsonArray.put(getToolbarsStylesSelectionsTableJSONObject());

		return jsonArray;
	}

	protected JSONObject getToolbarsStylesSelectionsLinkJSONObject() {
		JSONObject jsonObject = JSONFactoryUtil.createJSONObject();

		jsonObject.put("buttons", toJSONArray("['linkEdit']"));
		jsonObject.put("name", "link");
		jsonObject.put("test", "AlloyEditor.SelectionTest.link");

		return jsonObject;
	}

	protected JSONObject getToolbarsStylesSelectionsTableJSONObject() {
		JSONObject jsonObject = JSONFactoryUtil.createJSONObject();

		jsonObject.put(
			"buttons",
			toJSONArray(
				"['tableRow', 'tableColumn', 'tableCell', 'tableRemove']"));
		jsonObject.put(
			"getArrowBoxClasses",
			"AlloyEditor.SelectionGetArrowBoxClasses.table");
		jsonObject.put("name", "table");
		jsonObject.put("setPosition", "AlloyEditor.SelectionSetPosition.table");
		jsonObject.put("test", "AlloyEditor.SelectionTest.table");

		return jsonObject;
	}

	protected JSONObject getToolbarsStylesSelectionsTextJSONObject() {
		JSONObject jsonObject = JSONFactoryUtil.createJSONObject();

		jsonObject.put(
			"buttons",
			toJSONArray(
				"['styles', 'bold', 'italic', 'underline', 'link', " +
					"'twitter']"));
		jsonObject.put("name", "text");
		jsonObject.put("test", "AlloyEditor.SelectionTest.text");

		return jsonObject;
	}

	private ItemSelector _itemSelector;

}