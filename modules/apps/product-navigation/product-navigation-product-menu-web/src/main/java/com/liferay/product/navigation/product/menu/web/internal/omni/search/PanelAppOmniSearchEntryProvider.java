/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.product.navigation.product.menu.web.internal.omni.search;

import com.liferay.application.list.PanelApp;
import com.liferay.application.list.PanelAppRegistry;
import com.liferay.application.list.PanelCategory;
import com.liferay.application.list.constants.PanelCategoryKeys;
import com.liferay.application.list.display.context.logic.PanelCategoryHelper;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.product.navigation.omni.search.OmniSearchProvider;
import com.liferay.product.navigation.omni.search.OmniSearchResult;

import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Marcos Castro
 * @author Thiago Buarque
 */
@Component(service = OmniSearchProvider.class)
public class PanelAppOmniSearchEntryProvider implements OmniSearchProvider {

	@Override
	public List<OmniSearchResult> getOmniSearchResults(
			HttpServletRequest httpServletRequest, ThemeDisplay themeDisplay)
		throws PortalException {

		List<OmniSearchResult> omniSearchResults = new ArrayList<>();

		try {
			for (String rootPanelCategoryKey : _ROOT_PANEL_CATEGORY_KEYS) {
				List<PanelCategory> childPanelCategories =
					_panelCategoryHelper.getChildPanelCategories(
						rootPanelCategoryKey, themeDisplay);

				for (PanelCategory childPanelCategory : childPanelCategories) {
					_addOmniSearchResults(
						childPanelCategory,
						_getRootPanelCategoryLabel(
							httpServletRequest, rootPanelCategoryKey),
						omniSearchResults, httpServletRequest, themeDisplay);

					List<PanelCategory> grandchildPanelCategories =
						_panelCategoryHelper.getChildPanelCategories(
							childPanelCategory.getKey(), themeDisplay);

					for (PanelCategory grandchildPanelCategory :
							grandchildPanelCategories) {

						_addOmniSearchResults(
							grandchildPanelCategory,
							childPanelCategory.getLabel(
								themeDisplay.getLocale()),
							omniSearchResults, httpServletRequest,
							themeDisplay);
					}
				}
			}
		}
		catch (Exception exception) {
			throw new PortalException(exception);
		}

		if (omniSearchResults.isEmpty()) {
			return Collections.emptyList();
		}

		return Collections.singletonList(
			new OmniSearchResult(
				"grid", omniSearchResults,
				LanguageUtil.get(httpServletRequest, "navigation")));
	}

	@Activate
	protected void activate() {
		_panelCategoryHelper = new PanelCategoryHelper(_panelAppRegistry);
	}

	private void _addOmniSearchResults(
			PanelCategory panelCategory, String parentLabel,
			List<OmniSearchResult> omniSearchResults,
			HttpServletRequest httpServletRequest, ThemeDisplay themeDisplay)
		throws Exception {

		List<PanelApp> panelApps = _panelAppRegistry.getPanelApps(
			panelCategory.getKey(), themeDisplay.getPermissionChecker(),
			themeDisplay.getScopeGroup());

		for (PanelApp panelApp : panelApps) {
			omniSearchResults.add(
				new OmniSearchResult(
					parentLabel + " \u203a " +
						panelCategory.getLabel(themeDisplay.getLocale()),
					"grid", panelApp.getLabel(themeDisplay.getLocale()),
					String.valueOf(
						panelApp.getPortletURL(httpServletRequest))));
		}
	}

	private String _getRootPanelCategoryLabel(
		HttpServletRequest httpServletRequest, String rootPanelCategoryKey) {

		if (rootPanelCategoryKey.equals(
				PanelCategoryKeys.SITE_ADMINISTRATION)) {

			return LanguageUtil.get(httpServletRequest, "site-administration");
		}

		return LanguageUtil.get(httpServletRequest, "applications-menu");
	}

	private static final String[] _ROOT_PANEL_CATEGORY_KEYS = {
		PanelCategoryKeys.APPLICATIONS_MENU,
		PanelCategoryKeys.SITE_ADMINISTRATION
	};

	@Reference
	private PanelAppRegistry _panelAppRegistry;

	private PanelCategoryHelper _panelCategoryHelper;

}