/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.product.navigation.omni.search.web.internal.portlet.action;

import com.liferay.asset.kernel.AssetRendererFactoryRegistryUtil;
import com.liferay.asset.kernel.model.AssetRenderer;
import com.liferay.asset.kernel.model.AssetRendererFactory;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.portlet.JSONPortletResponseUtil;
import com.liferay.portal.kernel.portlet.LiferayPortletRequest;
import com.liferay.portal.kernel.portlet.LiferayPortletResponse;
import com.liferay.portal.kernel.portlet.bridges.mvc.BaseMVCResourceCommand;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCResourceCommand;
import com.liferay.portal.kernel.search.Field;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.security.permission.ResourceActionsUtil;
import com.liferay.portal.kernel.service.LayoutLocalService;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.search.document.Document;
import com.liferay.portal.search.hits.SearchHit;
import com.liferay.portal.search.hits.SearchHits;
import com.liferay.portal.search.searcher.SearchRequestBuilderFactory;
import com.liferay.portal.search.searcher.SearchResponse;
import com.liferay.portal.search.searcher.Searcher;
import com.liferay.product.navigation.omni.search.OmniSearchProvider;
import com.liferay.product.navigation.omni.search.OmniSearchResult;
import com.liferay.product.navigation.omni.search.web.internal.constants.ProductNavigationOmniSearchPortletKeys;

import jakarta.portlet.PortletURL;
import jakarta.portlet.ResourceRequest;
import jakarta.portlet.ResourceResponse;

import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.osgi.service.component.annotations.ReferencePolicyOption;

/**
 * @author Marcos Castro
 * @author Thiago Buarque
 */
@Component(
	property = {
		"jakarta.portlet.name=" + ProductNavigationOmniSearchPortletKeys.PRODUCT_NAVIGATION_OMNI_SEARCH,
		"mvc.command.name=/omni_search/omni_search_results"
	},
	service = MVCResourceCommand.class
)
public class OmniSearchResultsMVCResourceCommand
	extends BaseMVCResourceCommand {

	@Override
	protected void doServeResource(
			ResourceRequest resourceRequest, ResourceResponse resourceResponse)
		throws Exception {

		ThemeDisplay themeDisplay = (ThemeDisplay)resourceRequest.getAttribute(
			WebKeys.THEME_DISPLAY);

		if (!themeDisplay.isSignedIn() ||
			!FeatureFlagManagerUtil.isEnabled(
				themeDisplay.getCompanyId(), "LPD-78171")) {

			JSONPortletResponseUtil.writeJSON(
				resourceRequest, resourceResponse,
				_jsonFactory.createJSONArray());

			return;
		}

		LiferayPortletRequest liferayPortletRequest =
			_portal.getLiferayPortletRequest(resourceRequest);
		LiferayPortletResponse liferayPortletResponse =
			_portal.getLiferayPortletResponse(resourceResponse);

		HttpServletRequest httpServletRequest =
			_portal.getOriginalServletRequest(
				_portal.getHttpServletRequest(liferayPortletRequest));

		String keywords = ParamUtil.getString(httpServletRequest, "keywords");

		List<OmniSearchResult> sections = new ArrayList<>();

		for (OmniSearchProvider omniSearchProvider : _omniSearchProviders) {
			try {
				List<OmniSearchResult> providerSections =
					omniSearchProvider.getOmniSearchResults(
						httpServletRequest, themeDisplay);

				if (Validator.isNotNull(keywords)) {
					String lowerCaseKeywords = keywords.trim(
					).toLowerCase();

					List<OmniSearchResult> filteredSections = new ArrayList<>();

					for (OmniSearchResult providerSection : providerSections) {
						OmniSearchResult filteredSection = _filterSection(
							providerSection, lowerCaseKeywords);

						if (filteredSection != null) {
							filteredSections.add(filteredSection);
						}
					}

					providerSections = filteredSections;
				}

				sections.addAll(providerSections);
			}
			catch (Exception exception) {
				_log.error(
					"Unable to get results from " + omniSearchProvider,
					exception);
			}
		}

		if (Validator.isNotNull(keywords)) {
			String redirect = _portal.escapeRedirect(
				ParamUtil.getString(httpServletRequest, "redirect"));

			if (Validator.isNull(redirect)) {
				Layout layout = themeDisplay.getLayout();

				redirect = (layout != null) ?
					_portal.getLayoutFriendlyURL(layout, themeDisplay) :
						themeDisplay.getURLHome();
			}

			OmniSearchResult searchSection = _buildSearchSection(
				keywords, redirect, themeDisplay, liferayPortletRequest,
				liferayPortletResponse);

			if (searchSection != null) {
				sections.add(searchSection);
			}
		}

		JSONArray sectionsJSONArray = _jsonFactory.createJSONArray();

		for (OmniSearchResult section : sections) {
			sectionsJSONArray.put(_toJSONObject(section));
		}

		JSONPortletResponseUtil.writeJSON(
			resourceRequest, resourceResponse, sectionsJSONArray);
	}

	private OmniSearchResult _buildSearchResult(
			Document document, String redirect, ThemeDisplay themeDisplay,
			LiferayPortletRequest liferayPortletRequest,
			LiferayPortletResponse liferayPortletResponse)
		throws Exception {

		String className = document.getString(Field.ENTRY_CLASS_NAME);

		if (Validator.isNull(className)) {
			return null;
		}

		long classPK = GetterUtil.getLong(
			document.getString(Field.ENTRY_CLASS_PK));

		long rootClassPK = GetterUtil.getLong(
			document.getString(Field.ROOT_ENTRY_CLASS_PK));

		if (rootClassPK > 0) {
			classPK = rootClassPK;
		}

		Locale locale = themeDisplay.getLocale();

		if (className.equals(Layout.class.getName())) {
			Layout layout = _layoutLocalService.fetchLayout(classPK);

			if (layout == null) {
				return null;
			}

			String type = ResourceActionsUtil.getModelResource(
				locale, className);

			Group group = layout.getGroup();

			if (group != null) {
				type = type + " - " + group.getDescriptiveName(locale);
			}

			return new OmniSearchResult(
				type, "page", layout.getName(locale),
				_portal.getLayoutFriendlyURL(layout, themeDisplay));
		}

		AssetRendererFactory<?> assetRendererFactory =
			AssetRendererFactoryRegistryUtil.getAssetRendererFactoryByClassName(
				className);

		if (assetRendererFactory == null) {
			return null;
		}

		AssetRenderer<?> assetRenderer = assetRendererFactory.getAssetRenderer(
			classPK);

		PermissionChecker permissionChecker =
			themeDisplay.getPermissionChecker();

		if ((assetRenderer == null) ||
			!assetRenderer.hasViewPermission(permissionChecker)) {

			return null;
		}

		String url = null;

		if (assetRenderer.hasEditPermission(permissionChecker)) {
			PortletURL editPortletURL = assetRenderer.getURLEdit(
				liferayPortletRequest, liferayPortletResponse);

			if (editPortletURL != null) {
				editPortletURL.setParameter("redirect", redirect);

				url = editPortletURL.toString();
			}
		}

		if (url == null) {
			url = assetRenderer.getURLViewInContext(
				liferayPortletRequest, liferayPortletResponse,
				StringPool.BLANK);
		}

		return new OmniSearchResult(
			assetRendererFactory.getTypeName(locale),
			assetRendererFactory.getIconCssClass(),
			assetRenderer.getTitle(locale), url);
	}

	private OmniSearchResult _buildSearchSection(
			String keywords, String redirect, ThemeDisplay themeDisplay,
			LiferayPortletRequest liferayPortletRequest,
			LiferayPortletResponse liferayPortletResponse)
		throws Exception {

		SearchResponse searchResponse = _searcher.search(
			_searchRequestBuilderFactory.builder(
			).companyId(
				themeDisplay.getCompanyId()
			).from(
				0
			).queryString(
				keywords
			).size(
				8
			).withSearchContext(
				searchContext -> {
					searchContext.setGroupIds(new long[0]);
					searchContext.setLocale(themeDisplay.getLocale());
					searchContext.setUserId(themeDisplay.getUserId());
				}
			).build());

		SearchHits searchHits = searchResponse.getSearchHits();

		List<OmniSearchResult> searchResults = new ArrayList<>();

		for (SearchHit searchHit : searchHits.getSearchHits()) {
			Document document = searchHit.getDocument();

			try {
				OmniSearchResult result = _buildSearchResult(
					document, redirect, themeDisplay, liferayPortletRequest,
					liferayPortletResponse);

				if (result != null) {
					searchResults.add(result);
				}
			}
			catch (Exception exception) {
				if (_log.isDebugEnabled()) {
					_log.debug(
						"Unable to render search hit " +
							document.getString(Field.ENTRY_CLASS_NAME),
						exception);
				}
			}
		}

		if (searchResults.isEmpty()) {
			return null;
		}

		return new OmniSearchResult(
			"search", searchResults,
			StringBundler.concat(
				LanguageUtil.get(themeDisplay.getLocale(), "results"), " (",
				searchResponse.getTotalHits(), ")"));
	}

	private OmniSearchResult _filterSection(
		OmniSearchResult section, String lowerCaseKeywords) {

		List<OmniSearchResult> filtered = new ArrayList<>();

		for (OmniSearchResult result : section.getOmniSearchResults()) {
			if (_matchesKeywords(result, lowerCaseKeywords)) {
				filtered.add(result);

				if (filtered.size() == 5) {
					break;
				}
			}
		}

		if (filtered.isEmpty()) {
			return null;
		}

		return new OmniSearchResult(
			section.getIcon(), filtered, section.getTitle());
	}

	private boolean _matchesKeywords(
		OmniSearchResult result, String lowerCaseKeywords) {

		String title = result.getTitle();

		if ((title != null) &&
			title.toLowerCase(
			).contains(
				lowerCaseKeywords
			)) {

			return true;
		}

		String description = result.getDescription();

		if ((description != null) &&
			description.toLowerCase(
			).contains(
				lowerCaseKeywords
			)) {

			return true;
		}

		return false;
	}

	private JSONObject _toJSONObject(OmniSearchResult omniSearchResult) {
		if (omniSearchResult.getType() == OmniSearchResult.Type.SECTION) {
			JSONArray itemsJSONArray = _jsonFactory.createJSONArray();

			for (OmniSearchResult child :
					omniSearchResult.getOmniSearchResults()) {

				itemsJSONArray.put(_toJSONObject(child));
			}

			return JSONUtil.put(
				"icon", omniSearchResult.getIcon()
			).put(
				"omniSearchResults", itemsJSONArray
			).put(
				"title", omniSearchResult.getTitle()
			).put(
				"type",
				omniSearchResult.getType(
				).getValue()
			);
		}

		return JSONUtil.put(
			"description", omniSearchResult.getDescription()
		).put(
			"icon", omniSearchResult.getIcon()
		).put(
			"title", omniSearchResult.getTitle()
		).put(
			"type",
			omniSearchResult.getType(
			).getValue()
		).put(
			"url", omniSearchResult.getURL()
		);
	}

	private static final Log _log = LogFactoryUtil.getLog(
		OmniSearchResultsMVCResourceCommand.class);

	@Reference
	private JSONFactory _jsonFactory;

	@Reference
	private LayoutLocalService _layoutLocalService;

	@Reference(
		cardinality = ReferenceCardinality.MULTIPLE,
		policy = ReferencePolicy.DYNAMIC,
		policyOption = ReferencePolicyOption.GREEDY
	)
	private volatile List<OmniSearchProvider> _omniSearchProviders;

	@Reference
	private Portal _portal;

	@Reference
	private Searcher _searcher;

	@Reference
	private SearchRequestBuilderFactory _searchRequestBuilderFactory;

}